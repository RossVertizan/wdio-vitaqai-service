
from __future__ import with_statement
from basic_utils import FSUtils as fs
import argparse
import sys
import yaml
import os.path
import re
import shutil


def open_config(args):
    if not fs.exists_file(args.config):
        print 'Config file does not exist: %s' % args.config
        sys.exit(1)
        
    else:
        config = yaml.load(open(args.config))
        return config
    

def conversion_details(args, srcdir, incdir):
    
    file_list = list()
    
    if not fs.exists_dir(args.dir):
        print 'Root directory does not exist: %s' % args.dir
        sys.exit(1)
    
    if not fs.exists_dir(srcdir):
        print 'Source directory does not exist: %s' % srcdir
        sys.exit(1)
        
    if not fs.exists_dir(incdir):
        print 'Header directory does not exist: %s' % incdir
        sys.exit(1)
        
    if args.srcfile is not None and not fs.exists_file(os.path.join(srcdir, args.srcfile)):
        print 'Source file does not exist: %s' % os.path.join(srcdir,args.srcfile)
        sys.exit(1)
        
    if args.srcfile is not None:
        file_list.append(os.path.join(srcdir, args.srcfile))
        output_file = os.path.splitext(args.srcfile)[0] + '.py'
        output_file = os.path.join(srcdir, output_file)
        return (file_list, output_file)
    
    else:
        file_list = fs.list_files(srcdir, pattern='.*cpp')
        outfile = os.path.basename(args.dir) + '.py'
        output_file = os.path.join(args.dir, outfile)
        return (file_list, output_file)
        
    
def parse_header(header_file):
    print '-'*80
    print 'Reading header'
    print '-'*80
    header_info = dict()
    header_info['included'] = list()
    header_info['consts'] = dict()
    header_info['classes'] = dict()
    header_info['methods'] = list()
    header_info['class_vars'] = dict()
    ignores = ['#ifndef',
               '#define',
               '#endif']
    
    if not fs.exists_file(header_file):
        print 'Header file does not exist: %s' % header_file
        sys.exit(1)

    else:
        hf = open(header_file)
        in_pubpriv = False
        in_enum = False
        
        for line in hf:
            #print line
            word_list = line.split()
            #print word_list
            
            if len(word_list) == 0:
                    pass
            
            elif word_list[0] in ignores:
                pass
                
            elif re.match('^\s*public:', line) or re.match('^\s*private:', line):
                #print 'Entering public/private declarations'
                in_pubpriv = True
                
            elif re.match('^.s*enum:', line):
                in_enum = True
            
            elif in_enum and re.match('^.*};', line):
                in_enum = False
                
            elif in_pubpriv and re.match('^.*};', line):
                in_pubpriv = False
            
            elif in_pubpriv and re.match('^.*\(.*\);\s*$', line):
                #print line
                method_list = line.split('(')
                method_list = method_list[0].split()
                method_name = method_list[-1]
                method_name = method_name.replace('(', '').replace(')', '').replace(';', '')
                header_info['methods'].append(method_name)
                print 'Found method: %s' % method_name
                
            elif in_pubpriv and re.match('^.*;.*$', line):
                #print line
                line_list = line.split(None, 2)
                name = line_list[1].replace(';', '')
                var_type = line_list[0].replace('*', '')
                header_info['class_vars'][name] = var_type
                print 'Found class var: %s of type %s' % (name, var_type)
            
            # Record include lines we will need them later
            elif re.match('^#include', line):
                (inc, included) = line.split()
                if re.match('<.*>', included):
                    pass
                else:
                    included = included.replace('"', '')
                    header_info['included'].append(included)
            
            elif re.match('^const', line):
                const_list = line.split()
                data = const_list[-1]
                (name, value) = data.split('(')
                value = value.replace(')', '').replace(';', '')
                header_info['consts'][name] = value
                
            elif re.match('class', line):
                class_list = line.split()
                class_name = class_list[1]
                
                inheritance_list = list()
                for inh in class_list[2:]:
                    inh = inh.replace(',', '')
                    if re.search('::', inh):
                        inh_class_list = inh.split('::')
                        inheritance_list.append(inh_class_list[1])
                header_info['classes'][class_name] = inheritance_list
                print 'Found class: %s %s' % (class_name, header_info['classes'][class_name])
                
            else:
                sys.stdout.write('Skipping: %s' % line)
        
        hf.close()
    # print ('\n\n')
    return header_info

def parse_cout_line(line):
    
    print_list = line.split('<<')
    print_statement = ''
    arguments = list()
    for entry in print_list[1:]:
        if re.search('endl;', entry):
            pass
        elif re.search('\".*\"', entry):
            regex = re.search(r'.*"(.*)".*', entry)
            if regex.group(1) == '/n':
                print_statement += '\\n'
            else:
                print_statement += regex.group(1)
        else:
            arguments.append(entry)
            print_statement += '%s'
            
    return (print_statement, arguments)

                
            
def convert_source(cppfile, pyfile, header_info, config):
    print '-'*80
    print 'Converting source'
    print '-'*80
    
    source_info = dict()
    source_info['streams'] = list()
    ignores = []
    in_class_init = False
    in_method = False
    in_comment = False
    class_name = ''
    indent = ''
    method_returns = ['void', 'bool', 'int', 'float', 'char', 'unsigned']
    std_types = ['bool', 'int', 'float', 'char', 'unsigned']
    
    # Open the cpp file and the pyfile
    src = open(cppfile)
    py = open(pyfile, 'w')
    
    # Write the py header
    py.write('# ' + '-'*78 + '\n')
    py.write('#   (c) Vertizan Limited 2011-2015\n')
    py.write('# ' + '-'*78 + '\n')
    py.write('\n\n')
    
    for line in src:
        line = line.replace('\n', '')
        for pattern in config['PrePatterns']:
            line = re.sub(pattern, config['PrePatterns'][pattern], line)
        # print '%s' % line
        word_list = line.split()
            
        
        if len(word_list) == 0:
            py.write('\n')
        
        # Start of block comments
        elif re.match('^\s*/\*', line):
            in_comment = True
        
        # End of block comments
        elif re.match('^.*\*/.*$', line):
            # print 'out comment'
            in_comment = False
        
        # In block comments
        elif in_comment:
            pass
        
        # Single line comment
        elif re.match('^\s*//.*$', line):
            line = line.lstrip()
            line = line.replace('//', '#')
            py.write('%s%s\n' % (indent, line))
        
        # Predeifed first word that we always ignore
        elif word_list[0] in ignores:
            pass
        
        # Detect the end of the class initialisation and process init
        elif in_class_init:
            # print line
            if re.search('{', line):
                in_class_init = False
            
            
            regex = re.search(r'\s*([a-zA-Z0-9_]+)\((.*)\).*', line)
            if regex is not None:
                args = regex.group(2)
                #args = args.replace('this', 'self')
                #args = args.replace('NULL', 'None')
                # Call super on the inherited classes
                # print '%s\n' % regex.group(1)
                if regex.group(1) in header_info['classes'][class_name]:
                    py.write('# TODO:  Review this\n')
                    #py.write('# %s              - DELETE WHEN WORKING\n' % line)
                    py.write('%ssuper(%s, self).__init__(%s)\n' % (indent, class_name, args))
                             
                elif regex.group(1) in header_info['class_vars']:
                    # lower_bound(this, 'Lower bound')
                    # self.lower_bound = GenField(self, 'Lower bound', datatype='32bit')
                    cpp_type = header_info['class_vars'][regex.group(1)]
                    if cpp_type in std_types:
                        py.write('%sself.%s(%s)\n' % (indent, regex.group(1), args))
                    elif cpp_type in config['ClassMap']:
                        class_map = config['ClassMap'][cpp_type]
                        #print class_map
                        #py.write('# %s              - DELETE WHEN WORKING\n' % line)
                        if len(class_map) == 1:
                            py.write('%sself.%s = %s(%s)\n' % (indent, regex.group(1), class_map[0], args))
                        else:
                            py.write('%sself.%s = %s(%s, %s)\n' % (indent, regex.group(1), class_map[0], args, ','.join(class_map[1:])))
                    else:
                        print 'Class_vars: Class_type %s not mapped' % cpp_type
                        sys.exit(1)
                
                
        # Class constructor or destructor
        elif re.search('::', word_list[0]):
            #py.write('# %s              - DELETE WHEN WORKING\n' % line)
            strip_line = line.replace('(', '').replace(')', '').replace('{', '').replace('}', '').replace(' ', '')
            strip_line = strip_line.rstrip(':')
            dec_list = strip_line.split('::')
            # print dec_list
            # Class constructor
            if dec_list[0] == dec_list[1]:
                if dec_list[0] in header_info['classes']:
                    class_name = dec_list[0]
                    py.write('#--')
                    py.write('# ' + '-'*78 + '\n')
                    py.write('#   Class: %s\n' % dec_list[0])
                    py.write('# ' + '-'*78 + '\n')
                    py.write('# %s\n' % line)
                    py.write('class %s(%s)\n' % (dec_list[0], ', '.join(header_info['classes'][class_name])))
                    py.write('\n')
                    indent = ' '*4
                    py.write('%sdef __init__():\n' % indent)
                    indent = ' '*8
                    in_class_init = True
                else:
                    print 'Class constructor: Class: %s not in header_info: %s' % (class_name, header_info['classes'])
            
            # Class destructor
            elif dec_list[0] == dec_list[1].replace('~', ''):
                indent = ' '*4
                py.write('# %s\n' % line)
                py.write('%sdef __del__():\n' % indent)
                indent = ' '*8
                py.write('%s# TODO - This may need some attention\n' % indent)
                py.write('%spass\n' % indent)
                
        # Method declaration
        elif word_list[0] in method_returns and re.search('::', word_list[1]):
            # strip_line = line.replace('(', '').replace(')', '').replace('{', '').replace('}', '').replace(' ', '')
            # strip_line = strip_line.rstrip(':')
            # dec_list = strip_line.split('::')
            # sig_list = dec_list[1].split('(')
            regex1 = re.search(r'.*::([a-zA-Z0-9_]+)\((.*)\).*', line)
            if regex1 is not None and regex1.group(1) in header_info['methods']:
                indent = ' '*4
                py.write('%s# %s\n' % (indent, regex1.group(1)))
                py.write('%s# ' % indent + '-'*78 + '\n')
                py.write('%s# %s\n' % (indent, line))
                #py.write('def %s(%s)\n' % (dec_list[0], ', '.join(header_info['classes'][dec_list[0]])))
                regex1 = re.search(r'.*::([a-zA-Z0-9_]+)\((.*)\).*', line)
                output = '    def %s(self, %s):' % (regex1.group(1), regex1.group(2))
                py.write('%s\n' % output)
                py.write('\n')
                indent = ' '*8
                in_method = True
            else:
                print 'Method: Method is not in header_info %s' % (line)
        
        # Include line
        elif re.match('^#include', line):
            #print line
            line_list = line.split()
            if re.search('<.*>', line):
                pass
            else:
                included = line_list[1].replace('"', '')
                (filename, ext) = os.path.splitext(included)
                py.write('import %s\n' % filename)
        
        # Constant line
        elif re.match('^const', line):
                const_list = line.split()
                data = const_list[-1]
                (name, value) = data.split('(')
                value = value.replace(')', '').replace(';', '')
                header_info['consts'][name] = value
        
        # Namespace declaration
        elif re.match('using namespace', line):
            pass
            # print '+++%s+++' % line
            #py.write('# %s              - DELETE WHEN WORKING\n' % line)
            
        # New declarations
        # Floats
        elif re.match('^\s*float', line):
            regex = re.match(r'^\s*float ([A-Za-z0-9_]+);*$', line)
            if regex:
                py.write('%s%s = float()\n' % (indent, regex.group(1)))
            else:
                py.write('%s%s\n' % (indent, line))
                
        # Bools
        elif re.match('^\s*bool', line):
            regex = re.match(r'^\s*bool ([A-Za-z0-9_]+)=(true|false);*$', line)
            if regex:
                py.write('%s%s = %s\n' % (indent, regex.group(1), regex.group(2)))
            else:
                py.write('%s%s\n' % (indent, line))
                
        # Unsigned with =
        elif re.match(r'^\s*unsigned .*=', line):
            regex = re.match(r'^\s*unsigned ([A-Za-z0-9_]+)\s*=\s*(.*);*$', line)
            if regex:
                py.write('%s%s = %s\n' % (indent, regex.group(1), regex.group(2)))
            else:
                py.write('%s%s\n' % (indent, line))
            
        # Unsigned
        elif re.match(r'^\s*unsigned', line):
            regex = re.match(r'^\s*unsigned ([A-Za-z0-9_]+);*$', line)
            if regex:
                py.write('%s%s = int()\n' % (indent, regex.group(1)))
            else:
                py.write('%s%s\n' % (indent, line))
                
        # GenField
        # GenField<unsigned> index1(this, "index1"); index1.al
        elif re.match(r'^\s*GenField', line):
            regex = re.match(r'^\s*(GenField<.*>) ([A-Za-z0-9_]+)\((.*?)\)(.*)$', line)
            if regex:
                class_map = config['ClassMap'][regex.group(1)]
                py.write('%s%s = %s(%s, %s)%s\n' % \
                         (indent, regex.group(2), class_map[0], regex.group(3), ', '.join(class_map[1:]), regex.group(4)))
            else:
                py.write('%s%s\n' % (indent, line))
        
        # Handling stringstreams
        elif re.match(r'^\s*stringstream', line):
            regex = re.match(r'^\s*stringstream ([A-Za-z0-9_]+).*$', line)
            py.write('%s%s = str()\n' % (indent, regex.group(1)))
            source_info['streams'].append(regex.group(1))
        
        # Handling cout
        elif re.match(r'^\s*cout', line):
            (print_statement, arguments) = parse_cout_line(line)
            py.write("%ssys.stdout.write('%s' %% (%s))\n" % (indent, print_statement, ','.join(arguments)))
        
        # Handling cerr
        elif re.match(r'^\s*cerr', line):
            (print_statement, arguments) = parse_cout_line(line)
            py.write("%ssys.stderr.write('%s' %% (%s))\n" % (indent, print_statement, ','.join(arguments)))
        
        # Handling output to string stream
        elif re.match(r'\s*[A-Za-z0-9_]+\s*<<', line):
            #print line
            regex = re.search('^\s*([A-Za-z0-9_]+)\s*<<.*$', line)
            #print 'R1: ' + regex.group(1)
            #print source_info['streams']
            if regex.group(1) in source_info['streams']:
                #print 'Processing'
                (print_statement, arguments) = parse_cout_line(line)
                #print print_statement
                py.write("%s%s += '%s' %% (%s)\n" % (indent, regex.group(1), print_statement, ','.join(arguments)))
                
        # Everything else
        else:
            # print line
            #py.write('# %s              - DELETE WHEN WORKING\n' % line)
            regex1 = re.search(r'^(\s*).*', line)
            spaced_line = line.replace('+', ' + ').replace('-', ' - ').replace('*', ' * ').replace('/', ' / ')
            spaced_line = spaced_line.replace(';', ' ; ').replace('=', ' = ').replace('.', ' . ')
            spaced_line_list = spaced_line.split()
            for index, text in enumerate(spaced_line_list):
                if text in header_info['class_vars'] \
                or text in header_info['methods']:
                    spaced_line_list[index] = 'self.%s' % text
                    
            joined_line_list = ' '.join(spaced_line_list)
            joined_line_list = joined_line_list.replace(' + ', '+').replace(' - ', '-').replace(' * ', '*').replace(' / ', '/')
            joined_line_list = joined_line_list.replace(' ; ', ';').replace(' = ', '=').replace(' . ', '.')
            py.write('%s%s\n' % (regex1.group(1), joined_line_list))
    
    # Close the files
    src.close()
    py.close()
    
    # Do a second pass to add the constants
    py = open(pyfile, 'r')
    tmp = open(pyfile+'.tmp', 'w')
    for line in py:
        for pattern in config['PostPatterns']:
            line = re.sub(pattern, config['PostPatterns'][pattern], line)
        
        if re.match('^#--', line):
            for const in header_info['consts']:
                tmp.write('%s = %s\n' % (const, header_info['consts'][const]))
            tmp.write('\n\n')
        else:
            tmp.write(line)
    py.close()
    tmp.close()
    shutil.copy2(pyfile+'.tmp', pyfile)
    
def assess_file(filename, data):
    
    fid = open(filename)
    
    for line in fid:
        if re.match('^\s*$', line):
            # Empty line
            pass
        elif re.match('^\s*//', line):
            # Comment line
            pass
        else:
            data['linecount'] += 1
            for key in data:
                if key is not 'linecount' and re.search(key, line):
                    data[key] += 1
                    
    return data
            
    
def assess_code(start_dir, config, outfile):
    
    # Get the Assess config
    assess_keys = config['Assess']
    
    # Initialise the data dictionary
    data =  dict()
    data['linecount'] = 0
    for key in assess_keys:
        data[key] = 0
        
    # Initialise the output file
    if not fs.exists_file(outfile):
        fid = open(outfile, 'w')
        fid.write('Directory,Num lines,')
        sort_keys = data.keys()
        sort_keys.sort()
        for key in sort_keys:
            if key != 'linecount':
                fid.write('%s,' % key)
        fid.write('\n')
        fid.close()
        
    
    # Find and analyse the files
    for dirName, subDirList, fileList in os.walk(start_dir):
        for filename in fileList:
            if re.match('.*[cpp|hpp|h]$', filename):
                data = assess_file(os.path.join(dirName, filename), data)
    
    # Write the data out to the file
    fid = open(outfile, 'a')
    fid.write('%s,%s,' % (os.path.basename(start_dir), data['linecount']))
    sort_keys = data.keys()
    sort_keys.sort()
    for key in sort_keys:
        if key != 'linecount':
            fid.write('%s,' % data[key])
    fid.write('\n')
    fid.close()
    
def append_file(master_file, appendee):
    fid = open(master_file, 'a')
    app = open(appendee)
    
    fid.write('#' + '-'*80 + '\n')
    fid.write('#     %s\n' % appendee)
    fid.write('#' + '-'*80 + '\n')
    for line in app:
        fid.write(line)
        
    fid.close()
    app.close()
    
    
def concat_code(source_dir, outfile):
    
    # Build a list of .cpp files, .hpp files and .h files
    cppfiles = list()
    hppfiles = list()
    hfiles = list()
    for dirName, subDirList, fileList in os.walk(source_dir):
        for filename in fileList:
            if re.match('.*cpp$', filename):
                cppfiles.append(os.path.join(dirName, filename))
            elif re.match('.*hpp$', filename):
                hppfiles.append(os.path.join(dirName, filename))
            elif re.match('.*h$', filename):
                hfiles.append(os.path.join(dirName, filename))
    
    fid = open(outfile, 'w')
    fid.write('#'*80 + '\n')
    fid.write('#     Created with cpp2py concat\n')
    fid.write('#'*80 + '\n')
    fid.close()
    
    # Add any .hpp files to the output file
    for hppfile in hppfiles:
        append_file(outfile, hppfile)
    
    # For every .h file out put that and then the matching .cpp file
    for hfile in hfiles:
        append_file(outfile, hfile)
        
        base_hfile = os.path.basename(hfile)
        search_cppfile = base_hfile.replace('.h', '.cpp')
        for cppfile in cppfiles:
            if re.search(search_cppfile, cppfile):
                append_file(outfile, cppfile)
                cppfiles.remove(cppfile)
    
    # Output any remaining .cpp files
    for cppfile in cppfiles:
        append_file(outfile, cppfile)

def indent_code(line):
    if re.match('^\s{1,2}([\S{1}].*$)', line):
        regex = re.match('^\s{1,2}([\S{1}].*$)', line)
        line =  '    %s\n' % regex.group(1)
    elif re.match('^\s{3,4}([\S{1}].*$)', line):
        regex = re.match('^\s{3,4}([\S{1}].*$)', line)
        line =  '        %s\n' % regex.group(1)
    elif re.match('^\s{5,6}([\S{1}].*$)', line):
        regex = re.match('^\s{5,6}([\S{1}].*$)', line)
        line =  '            %s\n' % regex.group(1)
    elif re.match('^\s{7,8}([\S{1}].*$)', line):
        regex = re.match('^\s{7,8}([\S{1}].*$)', line)
        line =  '                %s\n' % regex.group(1)
    elif re.match('^\s{9,10}([\S{1}].*$)', line):
        regex = re.match('^\s{9,10}([\S{1}].*$)', line)
        line =  '                    %s\n' % regex.group(1)
    elif re.match('^\s{11,12}([\S{1}].*$)', line):
        regex = re.match('^\s{11,12}([\S{1}].*$)', line)
        line =  '                        %s\n' % regex.group(1)
    return line

def translate_code(filename, patterns):
    
    fid = open(filename)
    out = open('cpp2py.tmp', 'w')
    
    for line in fid:
        for pattern in patterns:
            line = re.sub(pattern, patterns[pattern], line)
        line = indent_code(line)
        out.write(line)

    fid.close()
    out.close()
    shutil.copy2('cpp2py.tmp', filename)
    fs.delete_file('cpp2py.tmp')
    

#===============================================================================
# MAIN SECTION
#===============================================================================

# Setup the command line arguments
parser = argparse.ArgumentParser(description='Convert C++ code to Python')
subparsers = parser.add_subparsers(
                                    title='Sub-commands',
                                    dest='action',
                                    help='''The following sub-commands are available - use cpp2py <subcommand> -h for help'''
                                    )

# ------------------------------------------------------------------------------
parser_assess = subparsers.add_parser(
                'assess',
                help='Performs simple assessment of code')
parser_assess.add_argument('-d', '--dir',
                action = 'store',
                dest = 'dir',
                type = str,
                required = True,
                help = 'Path to the directory containing the source files',
                metavar = 'Source directory'
                )
parser_assess.add_argument('-c', '--config',
                action = 'store',
                dest = 'config',
                type = str,
                required = True,
                help = 'The full path to the configuration file',
                metavar = 'Config file'
                )
parser_assess.add_argument('-o', '--output',
                action = 'store',
                dest = 'output',
                type = str,
                required = True,
                help = 'Path/name of the output file',
                metavar = 'Output file'
                )

# ------------------------------------------------------------------------------
parser_multiassess = subparsers.add_parser(
                'multiassess',
                help='Performs multiple assessment of code')
parser_multiassess.add_argument('-d', '--dir',
                action = 'store',
                dest = 'dir',
                type = str,
                required = True,
                help = 'Path to the directory containing the source files',
                metavar = 'Source directory'
                )
parser_multiassess.add_argument('-c', '--config',
                action = 'store',
                dest = 'config',
                type = str,
                required = True,
                help = 'The full path to the configuration file',
                metavar = 'Config file'
                )
parser_multiassess.add_argument('-o', '--output',
                action = 'store',
                dest = 'output',
                type = str,
                required = True,
                help = 'Path/name of the output file',
                metavar = 'Output file'
                )

# ------------------------------------------------------------------------------
parser_concat = subparsers.add_parser(
                'concat',
                help='Performs concatenation of .cpp/.hpp files into a single file')
parser_concat.add_argument('-d', '--dir',
                action = 'store',
                dest = 'dir',
                type = str,
                required = True,
                help = 'Path to the directory containing the source files',
                metavar = 'Source directory'
                )
parser_concat.add_argument('-o', '--output',
                action = 'store',
                dest = 'output',
                type = str,
                required = True,
                help = 'Path/name of the output file',
                metavar = 'Output file'
                )
parser_concat.add_argument('-x', '--translate',
                action = 'store_true',
                dest = 'translate',
                required = False,
                help = 'Do basic translation'
                )
parser_concat.add_argument('-c', '--config',
                action = 'store',
                dest = 'config',
                type = str,
                required = True,
                help = 'The full path to the configuration file',
                metavar = 'Config file'
                )

# ------------------------------------------------------------------------------
parser_convert = subparsers.add_parser(
                'convert',
                help='Performs conversion of .cpp file - can be used after concat on single file')
parser_convert.add_argument('-c', '--config',
                action = 'store',
                dest = 'config',
                type = str,
                required = False,
                help = 'The full path to the configuration file',
                metavar = 'Config file'
                )
parser_convert.add_argument('-f', '--file',
                action = 'store',
                dest = 'srcfile',
                type = str,
                required = False,
                help = 'Name of the source file to convert',
                metavar='File to convert'
                )
parser_convert.add_argument('-d', '--dir',
                action = 'store',
                dest = 'dir',
                type = str,
                required = False,
                help = 'Path to the directory containing the source files',
                metavar = 'Source directory'
                )


args = parser.parse_args()
# print args.config

if args.action == 'assess':
    # For the assessment we will just take the name of the directory to traverse
    # and a config file which lists under the Assess: key the things to assess
    
    # Check that the config file exists and load it
    config = open_config(args)
    
    # Run the assessment
    assess_code(args.dir, config, args.output)
    
elif args.action == 'multiassess':
    # For the assessment we will just take the name of the directory to traverse
    # and a config file which lists under the Assess: key the things to assess
    
    # Check that the config file exists and load it
    config = open_config(args)
    
    # Run the assessment
    # dir_list = fs.list_dirs_with_content(args.dir, ['src', 'tests'])
    dir_list = fs.list_dirs(args.dir)
    for directory in dir_list:
        print('Assessing: %s' % directory)
        assess_code(directory, config, args.output)

    
elif args.action == 'concat':
    # Do the concatenation
    
    # Run the concatenation
    concat_code(args.dir, args.output)
    
    # Check that the config file exists and load it
    if args.translate:
        config = open_config(args)
        patterns = config['Patterns']
        translate_code(args.output, patterns)
    
        
    

# Convert the files
elif args.action == 'convert':

    
        
    # Check that the directory and if specified that the file exists - define output file name
    srcdir = os.path.join(args.dir, config['SourceSubDir'])
    incdir = os.path.join(args.dir, config['HeaderSubDir'])
    (file_list, output_file) = conversion_details(args, srcdir, incdir)
    
    
    # For each file
    pyfile_list = list()
    for cppfile in file_list:
        print '='*80
        print cppfile
        print '='*80
    
        pyfile = os.path.splitext(cppfile)[0] + '.py'
        incfile = os.path.join(incdir, os.path.splitext(os.path.basename(cppfile))[0] + '.h')
    
        # Create the output file (do one for each source file and then combine)
        pyfile = os.path.splitext(cppfile)[0] + '.py'
        pyfile_list.append(pyfile)
    
        # Parse the header file
        header_info = parse_header(incfile)
        
        # Convert the source file
        convert_source(cppfile, pyfile, header_info, config)
        
        
    # Combine multiple files into a single output file
    print 'Combining to: %s' % output_file
    if args.srcfile is None:
        with open(output_file, 'w') as outfile:
            for fname in pyfile_list:
                with open(fname) as infile:
                    for line in infile:
                        outfile.write(line)
        outfile.close()
                
                
# python cpp2py.py multiassess -d /s/regressions/regression/regression -c cpp2py.yml -o reg_tests.csv
# python cpp2py.py multiassess -d /s/customers/Cascoda/Southampton/wpan_sap_cascoda -c cpp2py.yml -o wpan_sap_cascoda.csv
# python cpp2py.py multiassess -d /s/customers/Cascoda/Southampton/wpan_sap -c cpp2py.yml -o wpan_sap.csv
# python cpp2py.py multiassess -d /s/customers/NXP/Bangalore/ZigBee\ HA/vitaq_env -c cpp2py.yml -o zigbee_vitaq_env.csv
# python cpp2py.py multiassess -d /s/customers/NXP/Bangalore/ZigBee\ HA/zigbee_cov -c cpp2py.yml -o zigbee_cov.csv
# python cpp2py.py concat --dir /s/regressions/regression/regression/rel_constraint_test --output /s/regressions/tests/tests/rel_constraint/test_rel_constraint.py --translate --config cpp2py.yml