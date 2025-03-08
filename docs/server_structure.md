
```mermaid
graph 
  router[Router<br>198.162.50.1]

nginx[Nginx<br>192.168.50.]

subgraph IOT
end

subgraph Office
end

subgraph Guest
end

subgraph Media
  proxmox[ProxMox<br>192.168.50.71]
ubuntu[Ubuntu<br>192.168.50.72]
haos[Home Assistant<br>192.168.73]
end




```


```mermaid
---
title: Ubuntu 22 VM
---
graph
	nginx[NGINX<br>192.168.50.72<br>80 (http) 81 (admin) 443 (https)]
	dashy[dashy<br>192.168.50.72<br>4000]
	LubeLogger[dashy<br>192.168.50.72<br>8080]
```
