# Cube LUT Format Specification

A Cube file is a text file with extension ".cube". It contains 2 parts: the
header and the content. The header defines the properties of the LUT, while
the content holds lookup table transformation data. The content section starts
on a new line directly after last header definition.

The Cube LUT format supports 1D and 3D lookup tables, with an optional shaper
LUT preceding it.

---

### 1D LUT

A 1D lookup table allows output values to be specified corresponding to
equally spaced input values in a given range. In the header of the LUT, the
size and range of the LUT can be specified as follows:

LUT_1D_SIZE N
LUT_1D_INPUT_RANGE MIN_VAL MAX_VAL

where:
N - number of entries, up to a maximum of 65536
MIN_VAL - floating point input value corresponding to the first entry in the lookup table
MAX_VAL - floating point input value corresponding to the last entry in the lookup table

The lookup data follows the header and contains as many entries as specified in
the size entry in the header. Each line contains 3 space separated floating
point values corresponding to the R, G and B output values respectively.

The first line of data corresponds to the minimum input value specified in the header,
and the last line corresponds to the maximum input value. In between lines
corresponds to monotonically increasing scaled values of the input. For
example, if a LUT has size of 6 with minimum value 0.0 and maximum value 1.0,
then the 6 lines of the table would correspond to input values 0.0, 0.2, 0.4,
0.6, 0.8 and 1.0 respectively.

For any input values that are not explicitly mapped in the table, the result
is linearly interpolated between the nearest available values (i.e nearest
entry higher than the input and nearest entry lower than the input) in the table.

---

### 3D LUT

A 3D lookup table is conceptually similar to a 1D LUT except that it allows
for a lookup to be performed along each of the 3 color axes. This gives the
user the ability to model a transformation where a change in one color channel
may cause a change in the other two color channels as well.

Similar to a 1D LUT, the header contains information about the size of the
lookup table as well as the range of input values.

`LUT_3D_SIZE N`
`LUT_3D_INPUT_RANGE MIN_VAL MAX_VAL`

where:
`N` - number of entries per channel (NOTE: this results in a lookup table that has N * N * N entries)
`MIN_VAL` - floating point input value corresponding to the first entry in the lookup table
`MAX_VAL` - floating point input value corresponding to the last entry in the lookup table

The lookup data follows the header and contains N * N * N entries for a size N
specified in the header. Each line contains 3 space separated floating
point values corresponding to the R, G and B output values respectively.

The first line of data corresponds to the minimum input value specified in the
header for all 3 channels, and the last line corresponds to the maximum input
value for all 3 channels. In between lines corresponds to monotonically
increasing scaled values of the input, with R values changing most rapidly. For
example, if a LUT has size of 6 with minimum value 0.0 and maximum value 1.0,
then the entries would correspond to all combinations of the 6 possible values
for each input channel: 0.0, 0.2, 0.4, 0.6, 0.8 and 1.0 respectively.

The first 6 values would correspond to increasing values of R (from minimum to
maximum), while G and B are 0.0. The next 6 values would correspond to increasing values of R (again
starting from the minimum value) while G is 0.1 and B is 0.0. Once all values
of G are covered, B in increased to the next possible value and the whole
sequence is repeated. This continues until all combinations are covered.

In a 3D LUT, the 3 color components of the input value are used to find the nearest indexed values
along each axis of the 3D cube. The 3-component output value is calculated by interpolating within the
volume defined by the nearest corresponding positions along each axis in the LUT. Resolve supports 2 types
of interpolation for 3D LUTs - trilinear interpolation and tetrahedral interpolation.

---

### Shaper LUT

A LUT samples each of the axes in a uniform manner. However, there may be
cases where more precision is needed in a specific region of the input range
as opposed to the rest of it. In such cases, a shaper LUT can be used to
re-map the input range as a pre-processing step in order to make better use of
the LUT samples. Such an operation can be done using a 1D LUT and is called a
shaper LUT. Shaper LUTs can be applied before either a 1D LUT or a 3D LUT. It
is defined in the same way as a 1D LUT, and is defined first before the actual
LUT.

---

### Optional Properties

- Comments and descriptions can be inserted at any point. The line needs to
  start with the # character. Such lines are ignored by the parser.

- A LUT can be given a descriptive title using the TITLE keyword as follows:

`TITLE "Description"`

- In Resolve, LUTs are applied in data range (0.0 to 1.0). The input data is
  in data range, and the LUT is expected to output in data range. However,
  there may be LUTs that are designed to operate on and/or output video range
  data (64 - 940 in 10-bit scale). To handle these cases, there are two
  properties which can be used to notify Resolve that the input/output is in
  video range. Based on this, Resolve will handle the input/output values so
  that it works correctly in a data range processing pipeline. Depending on
  the LUT, one or both of these properties can be specified by having the
  keywords below on a new line.

`LUT_IN_VIDEO_RANGE`

`LUT_OUT_VIDEO_RANGE`

---

### Examples

Please look for these example files in DaVinci Resolve's installation folder.

On **MacOS**, they are located at:
- 1D LUT: `/Library/Application Support/Blackmagic Design/DaVinci Resolve/LUT/VFX IO/Linear to Cineon Log.cube`
- 3D LUT: `/Library/Application Support/Blackmagic Design/DaVinci Resolve/LUT/Blackmagic Design/Blackmagic 4.6K Film to Rec709.cube`
- Shaper LUT: `/Library/Application Support/Blackmagic Design/DaVinci Resolve/LUT/ACES/LMT ACES v0.1.1.cube`

On **Linux**, they are located at:
- 1D LUT: `/opt/resolve/LUT/VFX IO/Linear to Cineon Log.cube`
- 3D LUT: `/opt/resolve/LUT/Blackmagic 4.6K Film to Rec709.cube`
- Shaper LUT: `/opt/resolve/LUT/ACES/LMT ACES v0.1.1.cube`

On **Windows**, they are located at:
- 1D LUT: `%PROGAMDATA%\Blackmagic Design\DaVinci Resolve\LUT\VFX IO\Linear to Cineon Log.cube`
- 3D LUT: `%PROGAMDATA%\Blackmagic Design\DaVinci Resolve\LUT\Blackmagic Design\Blackmagic 4.6K Film to Rec709.cube`
- Shaper LUT: `%PROGAMDATA%\Blackmagic Design\DaVinci Resolve\LUT\ACES\LMT ACES v0.1.1.cube`

---

{{ include "giscus.md" }}