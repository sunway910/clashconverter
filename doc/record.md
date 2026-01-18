# 调试记录

用户输入
```text
ss://YWVzLTI1Ni1nY206ZzVNZUQ2RnQzQ1dsSklkQDE5OC41Ny4yNy4yMTg6NTAwNA==#v2rayse_test
vmess://eyJhZGQiOiIxNTQuMjMuMTkwLjE2MiIsInYiOjIsInBzIjoidjJyYXlzZV90ZXN0IiwicG9ydCI6NDQzLCJpZCI6ImI5OTg0Njc0LWY3NzEtNGU2Ny1hMTk4LWM3ZTYwNzIwYmEyYyIsImFpZCI6IjAiLCJzY3kiOiJhdXRvIiwibmV0Ijoid3MiLCJ0eXBlIjoiIiwidGxzIjoiIn0=
vmess://eyJhZGQiOiIxNTQuMjMuMTkwLjE2MiIsInYiOjIsInBzIjoidjJyYXlzZV90ZXN0IiwicG9ydCI6NDQzLCJpZCI6ImI5OTg0Njc0LWY3NzEtNGU2Ny1hMTk4LWM3ZTYwNzIwYmEyYyIsImFpZCI6IjAiLCJzY3kiOiJhdXRvIiwibmV0Ijoid3MiLCJ0eXBlIjoiIiwidGxzIjoiIn0=
ssr://MjAuMjM5LjQ5LjQ0OjU5ODE0Om9yaWdpbjpub25lOnBsYWluOk0yUm1OVGN5TnpZdE1ETmxaaTAwTldObUxXSmtaRFF0TkdWa1lqWmtabUZoTUdWbS8/Z3JvdXA9YUhSMGNITTZMeTkyTW5KaGVYTmxMbU52YlE9PSZyZW1hcms9ZGpKeVlYbHpaVjkwWlhOMA==
trojan://bc7593fe-0604-4fbe-a70bYWVzLTI1Ni1nY206Q1VuZFNabllzUEtjdTaclWNFc1RmRBNk5NQU5KSnga3fa58ac5a3ef0-b4ab-11eb-b65e-1239d0255272@ca-trojan.bonds.id:443#v2rayse_test
http://username:password@124.15.12.24:251
socks5://124.15.12.24:2312
hysteria://1.2.3.4:12854?protocol=udp&auth=pekopeko&peer=wechat.com&insecure=1&upmbps=50&downmbps=250&alpn=h3#Hys-1.2.3.4
vless://abc-def-ghi-fge-zsx@1.2.3.4:7777?encryption=none&security=tls&type=tcp&headerType=none#test
https://t.me/socks?server=1.2.3.4&port=123&user=username&pass=password
```

当前程序运行后的解析结果如下
```yaml
proxies:
  - {"type":"ss","name":"v2rayse_test_1","server":"198.57.27.218","port":5004,"cipher":"aes-256-gcm","password":"g5MeD6Ft3CWlJId"}
  - {"type":"vmess","name":"v2rayse_test_2","server":"154.23.190.162","port":443,"uuid":"b9984674-f771-4e67-a198-c7e60720ba2c","alterId":0,"cipher":"auto","network":"ws","tls":false,"skip-cert-verify":true}
  - {"type":"vmess","name":"v2rayse_test_3","server":"154.23.190.162","port":443,"uuid":"b9984674-f771-4e67-a198-c7e60720ba2c","alterId":0,"cipher":"auto","network":"ws","tls":false,"skip-cert-verify":true}
  - {"type":"ssr","name":"defaultName_1","server":"20.239.49.44","port":59814,"cipher":"dummy","password":"3df57276-03ef-45cf-bdd4-4edb6dfaa0ef","protocol":"origin","obfs":"plain","group":"https://v2rayse.com"}
  - {"type":"trojan","name":"v2rayse_test_4","server":"ca-trojan.bonds.id","port":443,"password":"bc7593fe-0604-4fbe-a70bYWVzLTI1Ni1nY206Q1VuZFNabllzUEtjdTaclWNFc1RmRBNk5NQU5KSnga3fa58ac5a3ef0-b4ab-11eb-b65e-1239d0255272","udp":true,"skip-cert-verify":true}
  - {"type":"http","name":"defaultName_2","server":"124.15.12.24","port":251,"username":"username","password":"password"}
  - {"type":"socks5","name":"defaultName_3","server":"124.15.12.24","port":2312}
  - {"type":"hysteria","name":"Hys-1.2.3.4","server":"1.2.3.4","port":12854,"auth_str":"pekopeko","protocol":"udp","skip-cert-verify":true,"sni":"wechat.com","up":50,"down":250,"alpn":["h3"]}
  - {"type":"vless","name":"test","server":"1.2.3.4","port":7777,"uuid":"abc-def-ghi-fge-zsx","network":"tcp","tls":true}
  - {"type":"socks5","name":"defaultName_4","server":"1.2.3.4","port":123,"username":"username","password":"password"}
```

期望的解析如下
```yaml
proxies:
  - {"name":"v2rayse_test_1","type":"ss","server":"198.57.27.218","port":5004,"password":"g5MeD6Ft3CWlJId","cipher":"aes-256-gcm"}
  - {"name":"v2rayse_test_2","type":"vmess","server":"154.23.190.162","port":443,"cipher":"auto","uuid":"b9984674-f771-4e67-a198-c7e60720ba2c","alterId":0,"tls":false,"skip-cert-verify":true,"network":"ws"}
  - {"name":"v2rayse_test_3","type":"vmess","server":"154.23.190.162","port":443,"cipher":"auto","uuid":"b9984674-f771-4e67-a198-c7e60720ba2c","alterId":0,"tls":false,"skip-cert-verify":true,"network":"ws"}
  - {"name":"defaultName_1","type":"ssr","server":"20.239.49.44","port":59814,"password":"3df57276-03ef-45cf-bdd4-4edb6dfaa0ef","cipher":"dummy","obfs":"plain","protocol":"origin","group":"https://v2rayse.com"}
  - {"name":"v2rayse_test_4","type":"trojan","server":"ca-trojan.bonds.id","port":443,"udp":true,"password":"bc7593fe-0604-4fbe-a70bYWVzLTI1Ni1nY206Q1VuZFNabllzUEtjdTaclWNFc1RmRBNk5NQU5KSnga3fa58ac5a3ef0-b4ab-11eb-b65e-1239d0255272","skip-cert-verify":true}
  - {"name":"defaultName_2","type":"http","server":"124.15.12.24","port":251,"username":"username","password":"password"}
  - {"name":"defaultName_3","type":"socks5","server":"124.15.12.24","port":2312}
  - {"name":"Hys-1.2.3.4","type":"hysteria","server":"1.2.3.4","port":12854,"sni":"wechat.com","skip-cert-verify":true,"alpn":["h3"],"protocol":"udp","auth_str":"pekopeko","up":50,"down":250}
  - {"name":"test","type":"vless","server":"1.2.3.4","port":7777,"uuid":"abc-def-ghi-fge-zsx","tls":true,"network":"tcp"}
  - {"name":"defaultName_4","type":"socks5","server":"1.2.3.4","port":123,"username":"username","password":"password"}
```

可以发现当前生成结果和正确结果一致，是符合预期的，但是当用户点击 `swap button` 切换模式后，`yaml` 无法正确地被解析为 `proxy links`，因为转换后应该剔除用户自定义的节点名称或者系统生成的默认节点名称

1: `ssr` 从 yaml 解析成 proxy links 出现错误，请参考如下 bash 命令的测试结果
```bash
# 对预期的结果进行 base64 ，decode
echo "MjAuMjM5LjQ5LjQ0OjU5ODE0Om9yaWdpbjphdXRvOnBsYWluOk0yUm1OVGN5TnpZdE1ETmxaaTAwTldObUxXSmtaRFF0TkdWa1lqWmtabUZoTUdWbS8/cmVtYXJrcz1aR1ZtWVhWc2RFNWhiV1ZmTVE9PSZncm91cD1hSFIwY0hNNkx5OTJNbkpoZVhObExtTnZiUT09" | base64 -d
20.239.49.44:59814:origin:auto:plain:M2RmNTcyNzYtMDNlZi00NWNmLWJkZDQtNGVkYjZkZmFhMGVm/?remarks=ZGVmYXVsdE5hbWVfMQ==&group=aHR0cHM6Ly92MnJheXNlLmNvbQ==#                                                        

# remark 部分还可以对其进行 based6 decode
echo "ZGVmYXVsdE5hbWVfMQ==" | base64 -d
defaultName_1#                                                                                                                                                                                                 

# group 部分还可以对其进行 based6 decode
echo "aHR0cHM6Ly92MnJheXNlLmNvbQ==" | base64 -d                    
https://v2rayse.com# 

# 当前生成的结果会导致 decode 错误
echo "ssr://MjAuMjM5LjQ5LjQ0OjU5ODE0Om9yaWdpbjphdXRvOnBsYWluOk0yUm1OVGN5TnpZdE1ETmxaaTAwTldObUxXSmtaRFF0TkdWa1lqWmtabUZoTUdWbS8=/?remarks=ZGVmYXVsdE5hbWVfMQ==&group=aHR0cHM6Ly92MnJheXNlLmNvbQ==" |base64
 -d
��base64: invalid input
```

用户输入如下
```yaml
proxies:
  - {"type":"ss","name":"v2rayse_test_1","server":"198.57.27.218","port":5004,"cipher":"aes-256-gcm","password":"g5MeD6Ft3CWlJId"}
  - {"type":"vmess","name":"v2rayse_test_2","server":"154.23.190.162","port":443,"uuid":"b9984674-f771-4e67-a198-c7e60720ba2c","alterId":0,"cipher":"auto","network":"ws","tls":false,"skip-cert-verify":true}
  - {"type":"vmess","name":"v2rayse_test_3","server":"154.23.190.162","port":443,"uuid":"b9984674-f771-4e67-a198-c7e60720ba2c","alterId":0,"cipher":"auto","network":"ws","tls":false,"skip-cert-verify":true}
  - {"type":"ssr","name":"defaultName_1","server":"20.239.49.44","port":59814,"cipher":"dummy","password":"3df57276-03ef-45cf-bdd4-4edb6dfaa0ef","protocol":"origin","obfs":"plain","group":"https://v2rayse.com"}
  - {"type":"trojan","name":"v2rayse_test_4","server":"ca-trojan.bonds.id","port":443,"password":"bc7593fe-0604-4fbe-a70bYWVzLTI1Ni1nY206Q1VuZFNabllzUEtjdTaclWNFc1RmRBNk5NQU5KSnga3fa58ac5a3ef0-b4ab-11eb-b65e-1239d0255272","udp":true,"skip-cert-verify":true}
  - {"type":"http","name":"defaultName_2","server":"124.15.12.24","port":251,"username":"username","password":"password"}
  - {"type":"socks5","name":"defaultName_3","server":"124.15.12.24","port":2312}
  - {"type":"hysteria","name":"Hys-1.2.3.4","server":"1.2.3.4","port":12854,"auth_str":"pekopeko","protocol":"udp","skip-cert-verify":true,"sni":"wechat.com","up":50,"down":250,"alpn":["h3"]}
  - {"type":"vless","name":"test","server":"1.2.3.4","port":7777,"uuid":"abc-def-ghi-fge-zsx","network":"tcp","tls":true}
  - {"type":"socks5","name":"defaultName_4","server":"1.2.3.4","port":123,"username":"username","password":"password"}
```

期望的结果应该是
```text
ss://YWVzLTI1Ni1nY206ZzVNZUQ2RnQzQ1dsSklk@198.57.27.218:5004#v2rayse_test_1
vmess://eyJ2IjoiMiIsInBzIjoidjJyYXlzZV90ZXN0XzIiLCJhZGQiOiIxNTQuMjMuMTkwLjE2MiIsInBvcnQiOjQ0MywiaWQiOiJiOTk4NDY3NC1mNzcxLTRlNjctYTE5OC1jN2U2MDcyMGJhMmMiLCJhaWQiOjAsInNjeSI6ImF1dG8iLCJuZXQiOiJ3cyIsInRscyI6IiJ9
vmess://eyJ2IjoiMiIsInBzIjoidjJyYXlzZV90ZXN0XzMiLCJhZGQiOiIxNTQuMjMuMTkwLjE2MiIsInBvcnQiOjQ0MywiaWQiOiJiOTk4NDY3NC1mNzcxLTRlNjctYTE5OC1jN2U2MDcyMGJhMmMiLCJhaWQiOjAsInNjeSI6ImF1dG8iLCJuZXQiOiJ3cyIsInRscyI6IiJ9
ssr://MjAuMjM5LjQ5LjQ0OjU5ODE0Om9yaWdpbjphdXRvOnBsYWluOk0yUm1OVGN5TnpZdE1ETmxaaTAwTldObUxXSmtaRFF0TkdWa1lqWmtabUZoTUdWbS8/cmVtYXJrcz1aR1ZtWVhWc2RFNWhiV1ZmTVE9PSZncm91cD1hSFIwY0hNNkx5OTJNbkpoZVhObExtTnZiUT09
trojan://bc7593fe-0604-4fbe-a70bYWVzLTI1Ni1nY206Q1VuZFNabllzUEtjdTaclWNFc1RmRBNk5NQU5KSnga3fa58ac5a3ef0-b4ab-11eb-b65e-1239d0255272@ca-trojan.bonds.id:443?type=tcp&security=tls&allowInsecure=1#v2rayse_test_4
http://username:password@124.15.12.24:251
socks5://124.15.12.24:2312
hysteria://1.2.3.4:12854?protocol=udp&auth=pekopeko&peer=wechat.com&insecure=1&upmbps=50&downmbps=250&alpn=h3#Hys-1.2.3.4
vless://abc-def-ghi-fge-zsx@1.2.3.4:7777?security=tls&type=tcp&encryption=none&headerType=none#test
socks5://username:password@1.2.3.4:123
```

目前得到的结果如下
```text
ss://YWVzLTI1Ni1nY206ZzVNZUQ2RnQzQ1dsSklk@198.57.27.218:5004#v2rayse_test_1
vmess://eyJ2IjoiMiIsInBzIjoidjJyYXlzZV90ZXN0XzIiLCJhZGQiOiIxNTQuMjMuMTkwLjE2MiIsInBvcnQiOjQ0MywiaWQiOiJiOTk4NDY3NC1mNzcxLTRlNjctYTE5OC1jN2U2MDcyMGJhMmMiLCJhaWQiOjAsInNjeSI6ImF1dG8iLCJuZXQiOiJ3cyIsInRscyI6IiJ9
vmess://eyJ2IjoiMiIsInBzIjoidjJyYXlzZV90ZXN0XzMiLCJhZGQiOiIxNTQuMjMuMTkwLjE2MiIsInBvcnQiOjQ0MywiaWQiOiJiOTk4NDY3NC1mNzcxLTRlNjctYTE5OC1jN2U2MDcyMGJhMmMiLCJhaWQiOjAsInNjeSI6ImF1dG8iLCJuZXQiOiJ3cyIsInRscyI6IiJ9
ssr://MjAuMjM5LjQ5LjQ0OjU5ODE0Om9yaWdpbjphdXRvOnBsYWluOk0yUm1OVGN5TnpZdE1ETmxaaTAwTldObUxXSmtaRFF0TkdWa1lqWmtabUZoTUdWbS8/cmVtYXJrcz1aR1ZtWVhWc2RFNWhiV1ZmTVE9PSZncm91cD1hSFIwY0hNNkx5OTJNbkpoZVhObExtTnZiUT09
trojan://bc7593fe-0604-4fbe-a70bYWVzLTI1Ni1nY206Q1VuZFNabllzUEtjdTaclWNFc1RmRBNk5NQU5KSnga3fa58ac5a3ef0-b4ab-11eb-b65e-1239d0255272@ca-trojan.bonds.id:443?type=tcp&security=tls&allowInsecure=1#v2rayse_test_4
http://username:password@124.15.12.24:251
socks5://124.15.12.24:2312
hysteria://1.2.3.4:12854?protocol=udp&auth=pekopeko&peer=wechat.com&insecure=1&upmbps=50&downmbps=250&alpn=h3#Hys-1.2.3.4
vless://abc-def-ghi-fge-zsx@1.2.3.4:7777?security=tls&type=tcp&encryption=none&headerType=none#test
socks5://username:password@1.2.3.4:123
```






