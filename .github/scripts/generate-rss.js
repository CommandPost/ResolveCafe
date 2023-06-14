const fs = require('fs').promises;
const path = require('path');
const RSS = require('rss');
const MarkdownIt = require('markdown-it');
const FeedParser = require('feedparser');
const glob = require('glob');
const util = require('util');

const md = new MarkdownIt({html: true});
const globPromise = util.promisify(glob);

function convertDateToRFC822(dateString) {
    dateString = dateString.replace(/\b(\d+)(st|nd|rd|th)\b/g, "$1");
    let date = new Date(dateString);
    return date.toUTCString();
}

function generateUrl(title) {
    return 'https://resolve.cafe/#' + title.toLowerCase().replace(/ /g, '-');
}

function entriesAreEqual(entry1, entry2) {
    return entry1.title === entry2.title &&
        entry1.guid === entry2.guid &&
        entry1.description === entry2.description &&
        entry1.url === entry2.url;
}

let pubDate = null;
let lastBuildDate = null;
let isContentChanged = false;

async function getOldFeedItems() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync('docs/rss.xml')) {
            resolve([]);
            return;
        }

        const feedparser = new FeedParser();
        const oldFeedItems = [];

        fs.createReadStream('docs/rss.xml').pipe(feedparser);

        feedparser.on('meta', function(meta) {
            pubDate = meta.pubdate || new Date();
            lastBuildDate = meta.date || new Date();
        });

        feedparser.on('readable', function() {
            let post;
            while (post = this.read()) {
                oldFeedItems.push(post);
            }
        });

        feedparser.on('end', function() {
            resolve(oldFeedItems);
        });

        feedparser.on('error', function(error) {
            reject(error);
        });
    });
}

async function updateFeedWithNewItems(feed, oldFeedItems) {
    const newsDir = path.join(__dirname, 'docs/_includes/news');
    const files = await globPromise(newsDir + '/*.md');

    for (const file of files) {
        const data = await fs.readFile(file, 'utf8');

        const entries = data.split('\n---\n');
        let currentTitle = '';
        let currentDate = '';

        for (const entry of entries) {
            const lines = entry.trim().split('\n');

            if (lines[0].startsWith('### ')) {
                currentTitle = lines[0].substring(4);
                currentDate = convertDateToRFC822(currentTitle);
                lines.shift();
            }

            if (lines.length === 0 || lines[0].startsWith('{{ include')) {
                continue;
            }

            let content = lines.join('\n').trim();

            content = md.render(content);

            content = content.replace(/{{ include ".*" }}/g, '')
                .replace(/\!\[([^\]]*)\]\(([^)]*)\)/g, (match, alt, src) => {
                    if (src.startsWith('../')) {
                        src = `https://resolve.cafe/${src.substring(3)}`;
                    }
                    return `<img src="${src}" alt="${alt}">`;
                })
                .replace(/\[\!button text="([^"]*)" target="([^"]*)" variant="([^"]*)"\]\(([^)]*)\)/g, '<a href="$4">$1</a>')
                .replace(/\{target="[^"]*"\}/g, '')
                .replace(/{target="[^"]*"}/g, '');

            let url = generateUrl(currentTitle);

            let newItem = {
                title: currentTitle,
                description: content,
                url: url,
                guid: url,
                date: currentDate,
            };

            let isOldItem = false;

            for (let oldItem of oldFeedItems) {
                if (entriesAreEqual(newItem, oldItem)) {
                    isOldItem = true;
                    break;
                }
            }

            if (!isOldItem) {
                isContentChanged = true;
                feed.item(newItem);
            }
        }
    }
}

(async function() {
    try {
        const feed = new RSS({
            title: 'Resolve Cafe - Latest News',
            description: 'The latest news from Resolve Cafe',
            feed_url: 'https://resolve.cafe/rss.xml',
            site_url: 'https://resolve.cafe',
            image_url: 'https://resolve.cafe/assets/images/favicon.png',
            managingEditor: 'Resolve Cafe',
            webMaster: 'Resolve Cafe',
            language: 'en',
            pubDate: pubDate,
            ttl: '60',
        });

        const oldFeedItems = await getOldFeedItems();

        await updateFeedWithNewItems(feed, oldFeedItems);

        if (isContentChanged) {
            const xml = feed.xml({indent: true});
            await fs.writeFile('docs/rss.xml', xml);
            console.log('Updated rss.xml');
        } else {
            console.log('No change in rss.xml');
        }
    } catch (error) {
        console.error(error);
    }
})();