#!/usr/bin/env sh
set -ex

cd "`dirname $0`"

if [ -z $VENV ]; then
    VENV=tools/_virtualenv
fi

# Create the virtualenv
if [ ! -d $VENV ]; then
    if [ -z $PYTHON ]; then
        command -v python
        if [ $? -eq 0 ]; then
            if [ `python -c 'import sys; print("%i" % (sys.hexversion<0x03000000))'` -eq 1 ]; then
                PYTHON=python
            fi
        fi
    fi

    if [ -z $PYTHON ]; then
        command -v python2
        if [ $? -eq 0 ]; then
            PYTHON=python2
        fi
    fi

    if [ -z $PYTHON ]; then
        echo "Please ensure Python 2 is installed"
        exit 1
    fi

    $PYTHON -m virtualenv $VENV || { echo "Please ensure virtualenv is installed"; exit 2; }
fi

# Install dependencies
$VENV/bin/pip install six==1.10.0 Template-Python==0.1.post1 html5lib==0.9999999 lxml==3.7.3 mercurial==4.1

# Run the build script
$VENV/bin/python tools/build.py "$@"
