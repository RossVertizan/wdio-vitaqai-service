"""
Utility to get a hierarchy of class methods
"""
from __future__ import (with_statement, absolute_import)

import sys
import re
#from pywinusb import hid
import applitools.eyes
from applitools.eyes import Eyes

global include_modules
global maxIndent
include_modules = ['pywinusb', 'hid']
exclude_modules = ['sys', 're', 'os', 'weakref', 'collections', 'ctypes', 'threading', 'subprocess', 'Struct', 'socket']

maxIndent = 10

# __import__(sys.argv[1])

# Example usage:
# python class_hierarchy vitaq


# Utility to traverse a class hierarchy
#----------------------------------------------------------------------
def TraverseClassHierarchy(module, member, indentLevel, methodList=list()):
    global exclude_modules
    global maxIndent
    
    #print module.__name__
    
    if member != "":
        module = getattr(module, member)
    
    if hasattr(module, '__name__') and module.__name__ not in exclude_modules:
        # print 'Module: %s' % module.__name__
    
        
        for item in dir(module):
            # print "---------- %s" % item
            
            # Ignore private items
            if re.match("^_", item):
                pass
            
            # Stop at the maximum indent
            elif indentLevel > maxIndent:
                pass
            
            # Collect data and recurse
            elif item not in methodList:
                print "  " * indentLevel + "- " + item
                methodList.append(item)
                # doc = getattr(module, "__doc__")
                # print doc
                if hasattr(module, item):
                    TraverseClassHierarchy(module, item, indentLevel + 1, methodList)
            


module = sys.modules['applitools']
TraverseClassHierarchy(module, "", 0)
