#!/usr/bin/env python3
"""Deploy this app with proxy-backed authentication, or inspect a deployment."""
import argparse
import base64
import json
import os
from pathlib import Path
import sys
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
TEAM = 'team_m3QmYLtACPWz2BdzbiJNpZ3g'
PROJECT = 'prj_TdAKs4RXxB9Q61RWN4GsX6pTkMNW'
FILES = (
    'index.html', 'app.js', 'lib.js', 'styles.css', 'favicon.svg', 'share.png',
    'package.json', 'package-lock.json', 'vercel.json', 'scripts/build.js',
    'scripts/serve.js', 'tests/lib.test.js', 'tests/build.test.js',
)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--status', metavar='DEPLOYMENT_ID', help='Read status without deploying')
    args = parser.parse_args()
    token = os.environ.get('VERCEL_TOKEN')
    if not token:
        sys.exit('VERCEL_TOKEN is not configured. Use the environment secret settings.')
    headers = {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}
    if args.status:
        if not args.status.startswith('dpl_') or not args.status.replace('_', '').isalnum():
            sys.exit('Invalid deployment ID')
        request = urllib.request.Request(
            f'https://api.vercel.com/v13/deployments/{args.status}?teamId={TEAM}', headers=headers)
    else:
        payload = {
            'name': 'viral', 'project': PROJECT, 'target': 'production',
            'files': [
                {'file': name, 'data': base64.b64encode((ROOT / name).read_bytes()).decode(), 'encoding': 'base64'}
                for name in FILES
            ],
        }
        request = urllib.request.Request(
            f'https://api.vercel.com/v13/deployments?teamId={TEAM}',
            data=json.dumps(payload).encode(), method='POST', headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            data = json.load(response)
    except urllib.error.HTTPError as error:
        sys.exit(f'Vercel API returned HTTP {error.code}; check access and project permissions.')
    except urllib.error.URLError:
        sys.exit('Vercel API connection failed; check network policy and proxy trust.')
    result = {key: data.get(key) for key in ('id', 'url', 'readyState', 'alias', 'errorCode')}
    print(json.dumps(result, ensure_ascii=False))
    if result['readyState'] in ('ERROR', 'CANCELED'):
        sys.exit(1)


if __name__ == '__main__':
    main()
