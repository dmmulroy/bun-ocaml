#include <stdio.h>
#include <dlfcn.h>

int main() {
    void *handle;
    void (*hello_func)();

    // Load the shared library
    handle = dlopen("./hello.dylib", RTLD_LAZY);
    if (!handle) {
        fprintf(stderr, "dlopen error: %s\n", dlerror());
        return 1;
    }

    // Clear any existing error
    dlerror();

    // Get the function from the library
    *(void **) (&hello_func) = dlsym(handle, "caml_hello");

    char *error = dlerror();
    if (error != NULL) {
        fprintf(stderr, "dlsym error: %s\n", error);
        return 1;
    }

    // Call the function
    hello_func();

    // Close the shared library
    dlclose(handle);

    return 0;
}
