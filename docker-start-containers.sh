#!/usr/bin/env bash

export DOCROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker-compose -f ${DOCROOT}/docker-compose.yml up -d postgres
