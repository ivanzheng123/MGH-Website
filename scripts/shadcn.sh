#!/usr/bin/env bash

cd ./apps/frontend || exit
npx shadcn@latest add "$@"
git add ./src/components/ui/
