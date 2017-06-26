#!/usr/bin/python3

import os

print("Running for years: ")

for year in [str(2005+i) for i in range(12)]:

    command = "node --max_old_space_size=32000 index.js "+year
    print("Running: ", command)
    os.system(command)