#!/usr/bin/env bash

export DOCROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

BASE_CONTAINERS="postgres"
docker-compose -f ${DOCROOT}/docker-compose.yml up -d ${BASE_CONTAINERS}
