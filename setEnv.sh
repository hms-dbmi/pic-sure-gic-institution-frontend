#!/bin/bash


if ! cmp -s "/usr/local/docker-config/httpd/httpd-vhosts.conf" "ui/httpd-vhosts.conf"  ; then
	mv /usr/local/docker-config/httpd/httpd-vhosts.conf /usr/local/docker-config/httpd/httpd-vhosts.conf.`date +%F_%T`
	cp ui/httpd-vhosts.conf /usr/local/docker-config/httpd/httpd-vhosts.conf
fi


