#需求1：抖音文本内容提取
1. 用户输入抖音视频分享链接：
https://www.douyin.com/user/self?from_tab_name=main&modal_id=7588715160664980913&showTab=favorite_collection
2. 系统解析视频内容，下载视频文件，存储到阿里云oss,
3. 使用ffmpeg提取视频文件中的音频，将音频存储到阿里云oss
4. 使用百炼等工具识别音频中的文本内容
5. 返回提取的文本内容及视频链接给用户

