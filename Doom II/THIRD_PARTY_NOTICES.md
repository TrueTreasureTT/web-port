# Doom II third-party notices

This project uses the open-source WebDOOM/PrBoom engine and, for the public web build, Freedoom Phase 2 game data.

## Freedoom

Freedoom Phase 2 is a free-content Doom-compatible game data set. The build downloads Freedoom 0.13.0 during CI and packages `freedoom2.wad` into the generated WebAssembly data file; the WAD is not committed to this repository.

Freedoom is licensed under the BSD 3-Clause license. The copyright and license notice is available from the official Freedoom project:

https://github.com/freedoom/freedoom/blob/v0.13.0/COPYING.adoc

## WebDOOM / PrBoom

The browser engine is based on WebDOOM, which in turn uses PrBoom source code. The upstream project is available at:

https://github.com/UstymUkhman/WebDOOM

The upstream project is distributed under its applicable open-source licenses. Its license notices are retained in the generated source tree used during the build.

## Original Doom II data

The commercial `DOOM2.WAD` is not included or redistributed by this repository. The public CI build uses Freedoom Phase 2 instead.
