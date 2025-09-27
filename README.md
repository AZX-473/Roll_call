# [Roll_call6班班级点名](https://azx-473.github.io/Roll_call/)

### 人名表请移步 [class_names](https://github.com/AZX-473/Roll_call/blob/main/classname.txt)
有‘"’是因为为了方便网站搭建，Main.cpp写成了这个样子（把每行一个名字变成这样子）

```cpp
#include<iostream>
#include<string>
using namespace std;
string name;
int main() {
    freopen("classname.txt", "w", stdout);
    while (cin>>name) {
        cout<<'"'<<name<<'"'<<',';
    }
}
```

~~绝对不是我懒得改~~
