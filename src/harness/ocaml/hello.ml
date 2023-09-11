external c_hello : unit -> string = "caml_hello"

let hello () = print_endline "Hello, world!"
let () = Callback.register "caml_hello" hello
