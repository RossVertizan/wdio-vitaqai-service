#!/usr/bin/env python

# Standard Python imports
#-------------------------------------------------------------------------------
from types import NoneType


# Anaic imports
#-------------------------------------------------------------------------------
from basic_utils import PyUtils as pu
from basic_utils import LogUtils as lu
from data_utils import EngUtils as eng


#===============================================================================
# CLASSES AND METHODS
#===============================================================================

# Class:
#===============================================================================
class YAML():
    log = lu.create_logger('YAML')

    # Main method - yaml_write
    #---------------------------------------------------------------------------
    @classmethod
    def yaml_write(cls, data, filename, order=list(), heading_depth=0, indent=2, no_sort=list()):

        # First open the file for write
        timestamp = pu.timestamp()
        cls.yfid = open(filename, 'w')
        cls.yfid.write('#'*80 + '\n')
        cls.yfid.write('# File created with yaml_write\n')
        cls.yfid.write('#   (%s)\n' % pu.timestamp())
        cls.yfid.write('#'*80 + '\n')
        cls.order = order
        cls.order.reverse()
        cls.no_sort = no_sort
        cls.heading_depth = heading_depth-1
        cls.indent = indent
        cls.heading_chars = ['=', '-', '.']

        # Now call the dispatcher and leave it all up to him
        depth = 0
        indent = ''
        prefix = ''
        cls.yaml_dispatcher(data, depth, indent, prefix)

        # Close the file
        cls.yfid.close()

    #
    #---------------------------------------------------------------------------
    @classmethod
    def yaml_dispatcher(cls, data, depth, indent, prefix, prevtype=None, heading=None, nosort=False):
        # if depth == 0:
        #     cls.yfid.write('\n\n')

        if prevtype == 'dict' \
        or prevtype == 'list':
            depth = depth + 1
            if isinstance(data, float) \
            or isinstance(data, int) \
            or isinstance(data, str) \
            or isinstance(data, unicode) \
            or isinstance(data, NoneType) \
            or isinstance(data, bool):
                if prevtype == 'dict':
                    prefix = cls.snap_dict_space(indent, prefix)
                elif prevtype == 'list':
                    prefix = prefix + '- '

            elif isinstance(data, dict):
                if len(data) > 5 and depth < 3:
                    cls.yfid.write('\n')
                if prevtype == 'dict':
                    print_data = ('%s%s' % (indent, prefix))
                    if '-' in indent:
                        index = indent.index('-')
                        header_preindent = ' '*index
                        len_heading = (len(prefix) + 1)
                    else:
                        len_heading = (len(prefix)-1)
                        header_preindent = indent
                    cls.yfid.write('%s%s\n' % (indent, prefix))
                    if heading is not None:
                        cls.yfid.write('%s#%s\n' % (header_preindent, heading*len_heading))
                        heading = None
                    prefix = ''
                    indent = cls.yaml_indent('plus', indent)
                    indent = indent.replace('-', ' ')

                elif prevtype == 'list':
                    indent = indent + '- '

            elif isinstance(data, list):
                if len(data) > 5 and depth < 3:
                    cls.yfid.write('\n')
                if prevtype == 'dict':
                    print_data = ('%s%s:' % (indent, prefix))
                    if '-' in indent:
                        index = indent.index('-')
                        header_preindent = ' '*index
                        len_heading = (len(prefix) + 1)
                    else:
                        len_heading = (len(prefix)-1)
                        header_preindent = indent
                    cls.yfid.write('%s%s\n' % (indent, prefix))
                    if heading is not None:
                        cls.yfid.write('%s#%s\n' % (header_preindent, heading*len_heading))
                        heading = None
                    prefix = ''
                    indent = cls.yaml_indent('plus', indent, amount=2)
                    indent = indent.replace('-', ' ')

                elif prevtype == 'list':
                    indent = indent + '- '

        # Determine the data type and call the appropriate function
        if isinstance(data, dict):
            cls.yaml_dictwriter(data, depth, indent, prefix, prevtype, heading, nosort)
        elif isinstance(data, list):
            cls.yaml_listwriter(data, depth, indent, prefix, prevtype, heading, nosort)
        elif isinstance(data, float):
            cls.yaml_fibwriter(data, depth, indent, prefix, prevtype, heading)
        elif isinstance(data, int):
            cls.yaml_fibwriter(data, depth, indent, prefix, prevtype, heading)
        elif isinstance(data, str):
            cls.yaml_stringwriter(data, depth, indent, prefix, prevtype, heading)
        elif isinstance(data, unicode):
            cls.yaml_stringwriter(data, depth, indent, prefix, prevtype, heading)
        elif isinstance(data, NoneType):
            cls.yaml_stringwriter(data, depth, indent, prefix, prevtype, heading)
        elif isinstance(data, bool):
            cls.yaml_fibwriter(data, depth, indent, prefix, prevtype, heading)
        else:
            cls.log.error('Unexpected data type (%s) - printing to file blindly' % type(data))
            #cls.yfid.write('%s%s%s' % (indent, prefix, data)
            prefix = ' '*4
            cls.yaml_stringwriter(data, depth, indent, prefix, prevtype, heading)

    #
    #---------------------------------------------------------------------------
    @classmethod
    def yaml_dictwriter(cls, data, depth, indent, prefix, prevtype, heading, nosort):
        prevtype = 'dict'
        keys = data.keys()
        if not nosort:
            keys.sort()
        # Jump the specified order keys to the front of the list
        for key in cls.order:
            if key in keys:
                keys.remove(key)
                keys.insert(0, key)

        for index, key in enumerate(keys):
            if key in cls.no_sort:
                nosort = True
            prefix = '%s:' % key
            if heading is None and cls.heading_depth >= depth:
                if depth > 2:
                    heading = cls.heading_chars[2]    #*(len(key))
                else:
                    heading = cls.heading_chars[depth]  #*(len(key))

            cls.yaml_dispatcher(data[key], depth, indent, prefix, prevtype, heading, nosort)
            if index == 0:
                #if indent.endswith('- '):
                indent = indent.replace('-', ' ')
            heading = None

    #
    #---------------------------------------------------------------------------
    @classmethod
    def yaml_listwriter(cls, data, depth, indent, prefix, prevtype, heading, nosort):
        prevtype = 'list'
        if not nosort:
            data.sort()
        # Jump the specified order items to the front of the list
        for key in cls.order:
            if key in data:
                data.remove(key)
                data.insert(0, key)

        for index, item in enumerate(data):
            if item in cls.no_sort:
                nosort = True
            if heading is None and cls.heading_depth >= depth:
                if depth > 2:
                    heading = cls.heading_chars[2]  #*(len(item))
                else:
                    heading = cls.heading_chars[depth]  #*(len(item))

            cls.yaml_dispatcher(data[index], depth, indent, prefix, prevtype, heading, nosort)
            if index == 0:
                indent = indent.replace('-', ' ')
                prefix = ''
            heading = None

    #
    #---------------------------------------------------------------------------
    @classmethod
    def yaml_fibwriter(cls, data, depth, indent, prefix, prevtype, heading=None):

        print_data = ('%s%s' % (prefix, data))
        if '-' in indent:
            index = indent.index('-')
            header_preindent = ' '*index
            header_postindent_num = len(indent) - index
            len_heading = (len(print_data)-1) + header_postindent_num
        else:
            len_heading = (len(print_data)-1)
            header_preindent = indent
        cls.yfid.write('%s%s\n' % (indent, print_data))
        if heading is not None:
            cls.yfid.write('%s#%s\n' % (header_preindent, heading*len_heading))
            heading = None


    #
    #---------------------------------------------------------------------------
    @classmethod
    def yaml_stringwriter(cls, data, depth, indent, prefix, prevtype, heading=None):

        print_data = ('%s"%s"' % (prefix, data))
        if '-' in indent:
            index = indent.index('-')
            header_preindent = ' '*index
            header_postindent_num = len(indent) - index
            len_heading = (len(print_data)-1) + header_postindent_num
        else:
            len_heading = (len(print_data)-1)
            header_preindent = indent
        cls.yfid.write('%s%s\n' % (indent, print_data))
        if heading is not None:
            cls.yfid.write('%s#%s\n' % (header_preindent, heading*len_heading))
            heading = None


    # Increment the indent
    #---------------------------------------------------------------------------
    @classmethod
    def yaml_indent(cls, operation, indent, amount=None):
        if amount is None:
            if operation == 'plus':
                indent = indent + ' '*cls.indent
            elif operation == 'minus':
                indent = ' '*(len(indent)-cls.indent)
        else:
            if operation == 'plus':
                indent = indent + ' '*amount
            elif operation == 'minus':
                indent = ' '*(len(indent)-amount)
        return indent

    # Make a prefix with a space that snaps to the ne
    #---------------------------------------------------------------------------
    @classmethod
    def snap_dict_space(cls, indent, prefix):

        snap_size = 24
        increment = (snap_size/2) + 1
        data = indent + prefix

        # Get the length of the prfix text and add increment spaces to it
        # (so we have some margin when snapping)
        start_length = len(data) + increment

        # Now snap this number to the nearest multiple of snap_size
        end_length = eng.snap(start_length, snap_size)

        # Now work out how many spaces this is
        num_spaces = end_length - len(data)
        if num_spaces == 0:
            num_spaces = snap_size
        prefix = prefix + ' '*num_spaces

        return prefix




#===============================================================================
# MAIN SECTION
#===============================================================================

# l=['a', 'b', 'c', 'd', 'e', 'f']
# d={'A': 1, 'B':2, 'C': 2.237645, 'D':45.2385, 'E': 'fred', 'F':'bob', 'G': True, 'H': False}
# ll = [l, l, l]
# dd = {'A': d, 'B': d, 'C': d}
# ld = [d, d, d]
# dl = {'A': l, 'B': l, 'C': l}
#
# lll = [ll, ll, ll]
# lld = [ld, ld, ld]
# ldd = [dd, dd, dd]
# ddl = {'A': dl, 'B': dl, 'C': dl}
# dll = {'A': ll, 'B': ll, 'C': ll}
# ddd = {'A': dd, 'B': dd, 'C': dd}
# ldl = [dl, dl, dl]
# dld = {'A': ld, 'B': ld, 'C': ld}
# data = [l, d, ld, dl, ll, dd, lll, lld, ldd, ddd, ddl, dll, ldl, dld]
# data = data
# YAML.yaml_write(data, 'test.yml', heading_depth=1, order=['B', 'E', 'F', 'f', 'e', 'd'])




#=============================== END OF FILE ===================================
#===============================================================================