1.用户配置好addr2line.exe", "readelf.exe" 所在的本地目录 
2.用户配置好需要解析的so符号表目录，类似于下面这种结构
so_name_map = {
    "libunity.so": {
        "arm32": "symbols/armeabi-v7a/libunity.so",
        "arm64": "symbols/arm64-v8a/libunity.so",
    },
    "libil2cpp.so": {
        "arm32": "symbols/armeabi-v7a/libil2cpp.so",
        "arm64": "symbols/arm64-v8a/libil2cpp.so",
    },
}

3.读入闪退堆栈
4.首先通过readelf判断符号表和堆栈是否匹配
下面是python读取buildid的实现
```
def getElfBuildId(elfpath, cputype):
    readelfpath = arm64readelfpath
    if cputype != "arm64":
        return ""
    if os.path.exists(readelfpath) == False:
        print("path not found:", readelfpath)
        return ""
    if os.path.exists(elfpath) == False:
        print("path not found:", elfpath)
        return ""
    command = [readelfpath, "-n", elfpath]
    print(" ".join(['"%s"' % command[0]] + command[1:]))
    p = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    text = p.communicate()[0]
    if text == None:
        text = ""
    if isinstance(text, bytes):
        text = text.decode("utf-8", "ignore")
    m = re.search(r"Build ID:\s*([0-9a-fA-F]+)", text)
    if m:
        return m.group(1).lower()
    print("WARN cannot read build-id:", text)
    return ""
def checkBuildId(so_name, line, symbolpath):
    if so_name not in checked_ids:
        checked_ids[so_name] = True
        expected_id = getExpectedIdFromLine(line)
        local_id = getElfBuildId(symbolpath, "arm64")
        print("expected_id:", expected_id, "local_id:", local_id)
        if expected_id and local_id:
            if local_id.find(expected_id) < 0 and expected_id.find(local_id) < 0:
                print("WARN build-id mismatch:", so_name, "log:", expected_id, "local:", local_id)
                return False
        else:
            if expected_id:
                print("WARN cannot read local build-id:", so_name, "path:", symbolpath)
            if local_id:
                print("WARN cannot read log build-id:", so_name)
                return False
        return True
    return True
```

5. 使用addr2line命令解析堆栈信息
python实现
```
def getPcLine(pcstr, cputype, so_name):
    symbolpath = os.path.join(curpath, so_name_map[so_name][cputype])
    toolepath = arm64path
    if cputype == "arm64":
        toolepath = arm64path
    command = """%s -f -C -e  %s %s""" % (toolepath, symbolpath, pcstr)
    print(command)
    ret = os.popen(command)
    text = ret.read()
    ret.close()
    return text
```

6.输出最终的解析后的堆栈信息