#!/bin/bash
set -e

# Configure /etc/frepple/djangosettings
sed -i "s/SECRET_KEY.*mzit.*i8b.*6oev96=.*/SECRET_KEY = \"$(mktemp -u XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX)\"/g" /etc/frepple/djangosettings.py
params=(-U ${POSTGRES_USER:-frepple})
if [ -n "$POSTGRES_HOST" ]; then
  params+=(-h $POSTGRES_HOST)
fi
if [ -n "$POSTGRES_PORT" ]; then
  params+=(-p $POSTGRES_PORT)
fi

# Djangosettings must be writeable by the web server to support installing&uninstalling apps
chmod g+w /etc/frepple/djangosettings.py

echo "Waiting for the database to be ready"
retries=10
until pg_isready --timeout=1 "${params[@]}" >/dev/null 2>&1
do
  sleep 1
  ((retries=retries-1))
  if [ $retries -eq 0 ]
  then
    echo "Can't connect to PostgreSQL on $POSTGRES_HOST:$POSTGRES_PORT as user ${POSTGRES_USER:-frepple}"
    exit 1
  fi
done

# Create and migrate the databases
frepplectl createdatabase --skip-if-exists
frepplectl migrate --noinput

# Configure Apache
grep -qxF 'ServerName' /etc/apache2/apache2.conf || echo "ServerName localhost" >> /etc/apache2/apache2.conf
rm -f /usr/local/apache2/logs/httpd.pid

# Allow custom configuration steps to be added
if [[ -d "/etc/frepple/entrypoint.d" ]]; then
  /bin/run-parts --verbose "/etc/frepple/entrypoint.d"
fi

# Start apache web server
echo "Starting web server"
exec apachectl -D FOREGROUND

exit 1