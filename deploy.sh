#!/bin/bash - 
# 本地打包上传手动CD工具

. /data/shell/data.sh

WEBDIR="/apps/deploy-shop/shop/data/nginx/shop"

# 1. 本地进行打包工作
npm run build
cd build/dist && tar zcf dist.tar.gz * && cd -

# 2. 清理和拷贝
ssh root@${SHOP_SERVER} "rm -rf ${WEBDIR}/*"
if [[ $? != 0 ]];then
  echo "前端服务端的前端代码异常"
  exit -1
fi

scp ./build/dist/dist.tar.gz root@${SHOP_SERVER}:${WEBDIR}
if [[ $? != 0 ]];then
  echo "解压缩前端代码到指定目录异常"
  exit -1
fi
ssh root@${SHOP_SERVER} "tar zxf ${WEBDIR}/dist.tar.gz -C ${WEBDIR}"
if [[ $? != 0 ]];then
  echo "解压缩前端代码到指定目录异常"
  exit -1
fi

# 3. 重启服务
ssh root@${SHOP_SERVER} "docker restart shop-nginx"
if [[ $? != 0 ]];then
  echo "重启前端容器异常"
  exit -1
fi

echo "打包并重启前端服务成功"
