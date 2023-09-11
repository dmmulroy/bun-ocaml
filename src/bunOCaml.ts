import { plugin, type BunPlugin } from "bun";
import { dirname } from "path";
import { dlopen, FFIType } from "bun:ffi";
import { existsSync } from "fs";

const BunOCaml: BunPlugin = {
  name: "Bun OCaml",
  setup(build) {
    build.onLoad({ filter: /\.ml$/ }, async (args) => {
      const cwd = dirname(args.path);

      // ocamlopt -output-complete-obj -o hello.o hello.ml
      console.log("Compiling OCaml module:", args.path);
      const compileOCamlModule = Bun.spawn({
        cmd: [
          "ocamlopt",
          "-output-complete-obj",
          "-o",
          args.path.replace(/\ml$/, "o"),
          args.path,
        ],
      });

      await compileOCamlModule.exited;

      console.log("Getting OCaml include path...");
      const ocamloptWhere = Bun.spawn({
        cmd: ["ocamlopt", "-where"],
        cwd,
      });

      const ocamlIncludePath = (
        await new Response(ocamloptWhere.stdout).text()
      ).trim();

      await ocamloptWhere.exited;

      // gcc -c -o hello_c.o -I `ocamlopt -where` hello_c.c
      console.log("Compiling C wrapper:", args.path.replace(/\.ml$/, "_c.c"));
      const compileCWrapper = Bun.spawn({
        cmd: [
          "gcc",
          "-c",
          "-o",
          `${args.path.replace(/\.ml$/, "_c.o")}`,
          "-I",
          ocamlIncludePath,
          `${args.path.replace(/\.ml$/, "_c.c")}`,
        ],
        cwd,
      });

      await compileCWrapper.exited;

      //gcc -o hello.dylib -dynamiclib hello.o hello_c.o -I `ocamlopt -where` -lm -ldl
      console.log("Compiling dynamic library");
      const compileDynamicLibrary = Bun.spawn({
        cmd: [
          "gcc",
          "-o",
          `${args.path.replace(/\ml$/, "dylib")}`,
          "-dynamiclib",
          `${args.path.replace(/\ml$/, "o")}`,
          `${args.path.replace(/\.ml$/, "_c.o")}`,
          "-I",
          ocamlIncludePath,
          "-lm",
          "-ldl",
        ],
        cwd,
      });

      await compileDynamicLibrary.exited;

      console.log("Done compiling OCaml module:", args.path);

      if (!existsSync(`${cwd}/hello.dylib`)) {
        console.error(
          "The dynamic library does not exist in the specified location."
        );
      }

      console.log("Loading dynamic library");
      const { symbols } = dlopen(`${cwd}/hello.dylib`, {
        caml_hello: {
          args: [],
          returns: FFIType.void,
        },
      });

      return {
        exports: {
          default: "Hello, world!",
          hello: symbols.caml_hello,
        },
        loader: "object",
      };
    });
  },
};

plugin(BunOCaml);

export default BunOCaml;
