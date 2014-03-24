#!/usr/bin/env bash
git clone $1 test-s2g-server
pushd test-s2g-server
echo `pwd`
npm -d install
npm test
npm run-script coverage
popd
