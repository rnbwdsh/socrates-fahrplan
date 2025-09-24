#!/bin/bash
TARGET=${TARGET:-markus@voidman.at}
set -ex
cd sveltekit && bun run build
mv -f build/* ../pocketbase/pb_public/
cd ../pocketbase && CGO_ENABLED=0 go build -o pocketbase main.go
ssh $TARGET 'pkill -f pocketbase; rm -f ~/pocketbase' || true
scp pocketbase $TARGET:~/pocketbase
ssh $TARGET 'nohup ./pocketbase serve --http=0.0.0.0:8090 </dev/null >/dev/null 2>&1 &' || true
rm -rf pocketbase pb_public/_app pb_public/index.html pb_public/favicon.png