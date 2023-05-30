# DaVinci Resolve IO Encode Plugin SDK

### Getting Started

The DaVinci Resolve IO Encode Plugin SDK enables development of additional codecs and container formats that can be rendered directly from DaVinci Resolve. These plugins can be distributed directly to customers who can use these in supported versions of DaVinci Resolve Studio. Currently, only CPU based plugins are supported.

---

### Plugin Format

Plugins should be distributed in the following format:

* Mac: 64-bit dynamic library
* Linux: 64-bit shared object
* Windows: 64-bit DLL

---

### Plugin Packaging

The plugin binary must be packaged in a bundle folder structure (similar to a Mac binary bundle). A single bundle may contain the plugin libraries for one or more architectures. The expected directory hierarchy is as follows:

```
PLUGIN.dvcp.bundle
    Contents
        ARCH_1
            PLUGIN.dvcp
        ARCH_2
            PLUGIN.dvcp
        ...
        ARCH_N
            PLUGIN.dvcp
```

where:
* `PLUGIN` is the name of the plugin (the exact name should be used in both the bundle and binary name)
* `ARCH_x` is the name of the architecture

The supported architectures on each operating system are:
* Mac: MacOS - for Apple Universal2 binaries (x86_64 + Arm64) or Arm64 build
* Mac: MacOS-x86-64 - on Intel only machines, this folder will be checked first, and if not found or empty, the MacOS folder will be checked
* Linux: Linux-x86-64
* Windows: Win64

---

### Example Plugin

The 'Examples' folder contains a sample plugin for the x264 encoder in the folder named 'x264_encoder_plugin'.

1. Compile the x264 plugin from source (downloadable from [here](https://www.videolan.org/developers/x264.html))
2. Modify `.mk.defs` (for Mac/Linux) or `plugin2015.vcxproj` (for Windows) in `x264_encoder_plugin` to point to the location of x264 install path.
3. From the `x264_encoder_plugin` folder, build the plugin via `make` on Mac/Linux, or using Visual Studio on Windows.

After the plugin has been successfully built, the target plugin library will be placed in the build folder. Package the plugin binary as per the naming convention above.
For example:

* Mac: `x264_encoder_plugin.dvcp.bundle/Contents/MacOS-x86-64/x264_encoder_plugin.dvcp`
* Linux: `x264_encoder_plugin.dvcp.bundle/Contents/Linux-x86-64/x264_encoder_plugin.dvcp`
* Windows: `x264_encoder_plugin.dvcp.bundle/Contents/Win64/x264_encoder_plugin.dvcp`

To activate the plugin in Resolve, copy 'x264_encoder_plugin.dvcp.bundle' folder to Application Support folder, into the 'IOPlugins' subfolder. The exact location is as follows:

* Mac: `/Library/Application Support/Blackmagic Design/DaVinci Resolve/IOPlugins`
* Mac (AppStore): `~/Library/Containers/com.blackmagic-design.DaVinciResolveAppStore/Data/Library/Application Support/IOPlugins`
* Linux: `/opt/resolve/IOPlugins`
* Windows: `%ProgramData%\Blackmagic Design\DaVinci Resolve\Support\IOPlugins`

Once the plugin folder is installed, start Resolve and create a timeline with clips. Go to the Deliver page. In the format list, the list of containers supported by the plugin should show up. If a plugin supported container format (or QuickTime) is chosen, codecs supported by the plugin should be visible in the codecs list. Upon selecting the plugin codec, the corresponding UI widgets will be shown in the render settings.
