# Introducing... The Perhaps ecosystem! With plib and pm

## Perhaps
Perhaps is a programming language I created by myself. It is not designed to replace any existing programming languages. It can't even read input.
Perhaps is just for simple probabilistic scripts.

# Syntax

There are some examples in the examples/directory

The syntax is a bit like c++. the main entry point is an: 

``` c++
int main() {
  
}
```

Printing stuff is like this:

``` c++
int main() {
  print("Hello World!");
}
```

Every variable is an int. For example:

``` c++
int main() {
  int num = 10;
  int char = "hi";
  int bool = true;

  print(num);
  print(char);
  print (bool)
```

Defining fuctions:

``` c++
int main() {
  int res = add(1,2);
  print(res);
}

void add(int num1, int num2) {
  return num1 + num2;
}
```

Importing:

``` c++
import "file.perhaps";
```

And finally:
``` c++

int main() {
  int x = 0;
  perhaps(x > 20, 0.5) {
    print("yay");
  } else {
    print("get it next time");
  }
}
```
What the custom perhaps() function does:

It takes 2 arguments: the condition and the probablity.
The value of x does not matter. There is 50% chance that it is bigger than 20. So, if it was 0.7, there would be a 70% chance.

Also, there are no if() functions. you must use probability.🤭🤭

## Plib

Plib is a library initializer.

Let's make a library.

First, initialize the directory.

``` bash
plib init my-lib
cd my-lib
```

Then, open src/main.perhaps. It already has some sample code.

Now, run:

``` bash
plib build
```
This takes all your files in the src/ folder and put them in one bundle.perhaps file

Remove all the comments that plib generates. The perhaps compiler doesn't like them. I might fix that later.

Now, make a hi.perhaps file.(You can name it whatever you want.)
Paste:
``` c++
import "my-lib/dist/my-lib.bundle.perhaps";

int main() {
  lib_init();
}
```
Run:
``` bash
perhaps main.perhaps
```
It works!

## pm

PM is a Package Manager for perhaps.

You can install a git repo, or a local library.

Let's install my-lib.

Run:
``` bash
pm install <path-to-my-lib>
```
It makes a p_modules/ directory.
You can now use it in your project.

#### Installing a git repo

``` bash
pm install https://github.com/test/test
# Will throw an error
```

# That's it!
For now :)
