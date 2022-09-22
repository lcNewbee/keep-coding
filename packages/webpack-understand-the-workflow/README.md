文章链接：https://mp.weixin.qq.com/s/DXjxZwhEJM8Hm8FtESxDEA

文章目的：手动实现一个简易webpack，理解webpack的工作流

webpack工作流总结：
1. 合并命令行和项目的配置
2. 利用标准化后的配置项调用webpack，实例化Compiler对象
3. 调用Compiler对象的run方法，开始编译
4. 从入口开始，根据文件类型和loader，编译文件及其依赖文档，获得module
5. 根据entry及其依赖生成chunk
6. 输出文档

