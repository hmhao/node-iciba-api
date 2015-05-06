# node-iciba-api

```
node src\server.js
```

访问
http://localhost:8080/api/v?q={word}

返回结果形如：

```
{
    "Angular": {
        "word": "Angular",
        "related": "Angular JS",
        "description": "利用数据绑定、依赖注入等技术构建webapp的框架。",
        "mp3": "http://res.iciba.com/resource/amp3/1/0/d1/8b/d18b8624a0f5f721da7b82365fc562dd.mp3"
    }
}
```