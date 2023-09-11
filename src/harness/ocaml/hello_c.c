/* File hello.c -- wrappers around the OCaml functions */

#include <stdio.h>
#include <string.h>
#include <caml/mlvalues.h>
#include <caml/callback.h>

static int ocaml_initialized = 0;

void caml_hello()
{

  if (ocaml_initialized == 0) {
    // Start the OCaml runtime if it hasn't been started yet
    char *fake_argv[] = { "", NULL };
    caml_startup(fake_argv);

    ocaml_initialized = 1;
  }


  static const value * hello_closure = NULL;

  if (hello_closure == NULL) {
    hello_closure = caml_named_value("caml_hello");
  }

  caml_callback(*hello_closure, Val_unit);
}

