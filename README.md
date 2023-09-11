# bun-ocaml

## Notes

How this works:
-bun:ffi let’s you dynamically load native libraries

- bun plugin that runs zig/rust compiler to compile the code on import, bun:ffi wraps the library
- bun plugin turns that wrapper into an ES module

bun:ffi to call c functions from JavaScript
Bun.spawn to spawn cargo/rustc
Bun.plugin to hook into module loading to export the ffi’d versions of functions

The functions must have a C calling convention. From there, bun calls dlopen()
and dlsym(). This works because many languages support C calling conventions
