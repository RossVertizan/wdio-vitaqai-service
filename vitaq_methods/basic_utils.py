#!/usr/bin/env python
"""


"""

from __future__ import with_statement, absolute_import, division


# Standard Python imports
# ------------------------------------------------------------------------------
import copy
import difflib
import importlib
import logging
import os
import re
import shutil
import string
import sys
import subprocess
import time
import yaml


# ==============================================================================
# CLASSES AND METHODS
# ==============================================================================


# Class: LogUtils
# ==============================================================================
class LogUtils():

    # Get logging setup from environment variables - define defaults
    # --------------------------------------------------------------------------
    @classmethod
    def get_log_settings(cls):
        # This method is going to return a tuple of the console logging level, the
        # log file name (if any) and the file logging level.
        valid_levels = ['CRITICAL', 'ERROR', 'WARNING', 'INFO', 'DEBUG']

        # Get the console_level from the env vars
        cls.get_console_log_level()

        # Get the logfile name
        cls.logfile_name = os.getenv('ADP_LOGFILE_NAME', None)

        # Get the logfile level - but only do it if we are going to have a logfile
        if cls.logfile_name is None:
            cls.logfile_level = None
        else:
            if 'ADP_LOGFILE_LEVEL' in os.environ:
                cls.logfile_level = os.environ['ADP_LOGFILE_LEVEL'].upper()
                if cls.logfile_level not in valid_levels:
                    msg = 'ADP_LOGFILE_LEVEL must be set to one of %s or not set' % valid_levels
                    print 'WARNING: get_log_settings: %s' % msg
                    msg = 'Using the default and using the same level as the console logging'
                    print 'INFO: get_log_settings: %s' % msg
                    cls.logfile_level = cls.console_level
            else:
                cls.logfile_level = cls.console_level

        return (cls.console_level, cls.logfile_name, cls.logfile_level)

    # Get the console level for logging
    # --------------------------------------------------------------------------
    @classmethod
    def get_console_log_level(cls):

        valid_levels = ['CRITICAL', 'ERROR', 'WARNING', 'INFO', 'DEBUG']

        # Get the console_level from the env vars
        if 'ADP_LOG_LEVEL' in os.environ:
            cls.console_level = os.environ['ADP_LOG_LEVEL'].upper()
            if cls.console_level not in valid_levels:
                msg = 'ADP_LOG_LEVEL must be set to one of %s or not set' % valid_levels
                print 'WARNING: get_log_settings: %s' % msg
                msg = 'Using the default logging level of WARNING'
                print 'INFO: get_log_settings: %s' % msg
                cls.console_level = 'WARNING'
        else:
            cls.console_level = 'WARNING'



    # Create a logger - return the logger object
    # --------------------------------------------------------------------------
    @classmethod
    def create_logger(cls, logger_root):

        # Create the logger object with the passed root for the logging
        logger = logging.getLogger(logger_root)

        # Only set the levels and handlers if this is a root logger
        if not re.search('\.', logger_root):
            cls.get_log_settings()
            logger.setLevel("DEBUG")

            # Create the console handler, set the level, create a formatter and put
            # them all together
            console_handler = logging.StreamHandler()
            console_handler.set_name('console')
            console_handler.setLevel(cls.console_level)
            console_formatter = logging.Formatter('%(levelname)-8s:%(module)s.%(funcName)s: %(message)s',
                                                  "%Y-%m-%d %H:%M:%S")
            console_handler.setFormatter(console_formatter)
            logger.addHandler(console_handler)

            # Create the file handler, set the level, create a formatter and put
            # them all together
            if cls.logfile_name is not None:
                logfile_handler = logging.FileHandler(cls.logfile_name, mode='w')
                logfile_handler.set_name('logfile')
                logfile_handler.setLevel(cls.logfile_level)
                logfile_formatter = logging.Formatter('%(asctime)s:%(levelname)-8s:%(module)s.%(funcName)s: %(message)s',
                                                  "%Y-%m-%d %H:%M:%S")
                logfile_handler.setFormatter(logfile_formatter)
                logger.addHandler(logfile_handler)

        return logger

    # Set the formatting for threaded applications
    # --------------------------------------------------------------------------
    @classmethod
    def set_thread_format(cls, logger):

        handlers = logger.handlers
        for handler in handlers:
            console_formatter = logging.Formatter('%(levelname)-8s:%(module)s.%(funcName)s:%(thread)d: %(message)s',
                                                  "%Y-%m-%d %H:%M:%S")
            logfile_formatter = logging.Formatter('%(asctime)s:%(levelname)-8s:%(module)s.%(funcName)s:%(thread)d: %(message)s',
                                                  "%Y-%m-%d %H:%M:%S")
            if handler.get_name() == 'console':
                handler.setFormatter(console_formatter)
            elif handler.get_name() == 'logfile':
                handler.setFormatter(logfile_formatter)

    # Set the formatting to default
    # --------------------------------------------------------------------------
    @classmethod
    def set_default_format(cls, logger):

        handlers = logger.handlers
        for handler in handlers:
            console_formatter = logging.Formatter('%(levelname)-8s:%(module)s.%(funcName)s: %(message)s',
                                                  "%Y-%m-%d %H:%M:%S")
            logfile_formatter = logging.Formatter('%(asctime)s:%(levelname)-8s:%(module)s.%(funcName)s: %(message)s',
                                                  "%Y-%m-%d %H:%M:%S")
            if handler.get_name() == 'console':
                handler.setFormatter(console_formatter)
            elif handler.get_name() == 'logfile':
                handler.setFormatter(logfile_formatter)

    # Print a none 'logging module' message to screen and/or file
    # This is not thread-safe so use with care
    # --------------------------------------------------------------------------
    @classmethod
    def message(cls, level, mtype, caller, *args, **kwargs):

        # This method should only be used for user output relating to results.  It
        # should not be used for reporting errors or warnings.

        # level - this is a number which controls when this message is printed
        #         it uses the same numbering as the logging module, so the higher
        #         the number the less verbose the output
        #         the set value is derived from the ADP_LOG_LEVEL env var
        #         100 - will always be printed
        #         -1  - will never be printed
        # mtype - defines the style of the message:
        #           'S' - STEP - single line output prefixed with 'STEP'
        #           'D' - DEBUG - single line output prefixed with 'DEBUG'
        #           'E' - ERROR - single line output prefixed with 'ERROR'
        #           'W' - WARNING - single line output prefixed with 'WARNING'
        #           'N' - NOTICE - single line output prefixed with 'NOTICE'
        #           'I' - INFO - single line output prefixed with 'INFO'
        #           'O' - OUTPUT - single line output prefixed with 'OUTPUT'
        #           'R' - RESULT - single line output prefixed with 'RESULT'
        #           'B' - BLOCK - block output (multi-line)
        #           'H' - HEADER - section header
        #           'T' - TITLE - major title block
        #           'BN', 'HN', 'TN' - same as without the N, but missing all of the details
        # keyword - single word describing the kind of output
        # caller - name of the calling funtion
        # message_format - the pre-formatted message or message format populated
        #           by *args
        # logfile - the name of the logfile to output message to
        #           if logfile is None, but $ADP_LOGFILE_NAME is set, then use that
        # timestamp - flag to indicate if logfile should include a timestamp

        # Decide if we will do anything
        do_message = cls.logging_level(level)

        # Return if we are not going to print anything
        if not do_message:
            return do_message

        # Unpack args - well the message
        if len(args) == 1:
            message = args[0]
        elif len(args) >= 1:
            message = args[0] % args[1:]
        else:
            message = ''

        # Unpack keyword arguments
        logfile = kwargs['logfile'] if 'logfile' in kwargs else None
        timestamp = kwargs['timestamp'] if 'timestamp' in kwargs else True
        flyback = kwargs['flyback'] if 'flyback' in kwargs else False


        # Develop timestrings
        console_timestring = ''
        logfile_timestring = ''
        if logfile is None:
            if 'ADP_OUTFILE_NAME' in os.environ:
                logfile = os.environ['ADP_OUTFILE_NAME']
            elif 'ADP_LOGFILE_NAME' in os.environ:
                logfile = os.environ['ADP_LOGFILE_NAME']
        if logfile is not None:
            if timestamp:
                logfile_timestring = time.strftime('%Y-%m-%d %H:%M:%S') + ':'


        # Define the format for the different types of message
        msg_keyword_format = {  'B'  : '%sBLOCK   :%s\n%s',
                                'BN' : '%s',
                                'D'  : '%sDEBUG   :%s: %s',
                                'E'  : '%sERROR   :%s: %s',
                                'W'  : '%sWARNING :%s: %s',
                                'N'  : '%sNOTICE  :%s: %s',
                                'I'  : '%sINFO    :%s: %s',
                                'O'  : '%sOUTPUT  :%s: %s',
                                'P'  : '%sPROGRESS:%s: %s',
                                'R'  : '%sRESULT  :%s: %s',
                                'S'  : '%sSTEP    :%s: %s',
                                'H'  : ' %s\n  (%s%s)\n'+'-'*80,
                                'T'  : '-'*80+'\n %s\n  (%s%s)\n'+'-'*80,
                                'HN' : ' %s\n'+'-'*80,
                                'TN' : '-'*80+'\n %s\n'+'-'*80,
                                'F'  : '%sFINISHED:%s\n'+'='*80+'\n'*2,
                                'ST' : '='*80+'\n%sSTART:%s'
                            }

        # Now do it
        if do_message:

            # Print to the screen
            # - define different argument orders for different formats
            # Had to do the carriage returns on a seperate line - don't understand why
            mtype = mtype.upper()
            if mtype in ['S', 'D', 'O', 'R', 'P', 'E', 'W', 'N', 'I']:
                if flyback:
                    sys.stdout.write(msg_keyword_format[mtype] % (console_timestring, caller, message))
                    sys.stdout.write('\r')
                else:
                    sys.stdout.write(msg_keyword_format[mtype] % (console_timestring, caller, message))
                    sys.stdout.write('\n')
            elif mtype in ['B']:
                sys.stdout.write(msg_keyword_format[mtype] % (console_timestring, caller, message))
                sys.stdout.write('\n')
            elif mtype in ['H', 'T']:
                sys.stdout.write(msg_keyword_format[mtype] % (message, console_timestring, caller))
                sys.stdout.write('\n')
            elif mtype in ['BN', 'HN', 'TN']:
                sys.stdout.write(msg_keyword_format[mtype] % (message))
                sys.stdout.write('\n')
            elif mtype in ['ST', 'F']:
                sys.stdout.write(msg_keyword_format[mtype] % (console_timestring, caller))
                sys.stdout.write('\n')
            else:
                sys.stdout.write('Unsupported message type: %s\n' % mtype)
            sys.stdout.flush()

            # Print to the file - THIS IS *NOT* THREAD SAFE
            if logfile is not None:
                with open(logfile, 'a') as logfileid:
                    if mtype in ['S', 'D', 'O', 'R', 'B', 'P', 'E', 'W', 'N', 'I']:
                        logfileid.write(msg_keyword_format[mtype]
                                        % (logfile_timestring, caller, message))
                    elif mtype in ['ST', 'F']:
                        logfileid.write(msg_keyword_format[mtype]
                                        % (logfile_timestring, caller))
                    elif mtype in ['H', 'T']:
                        logfileid.write(msg_keyword_format[mtype]
                                        % (message, logfile_timestring, caller))
                    elif mtype in ['BN', 'HN', 'TN']:
                        logfileid.write(msg_keyword_format[mtype] % (message))
                    logfileid.write('\n')

    # End flyback - when flyback is used it has to be ended outside the loop
    # --------------------------------------------------------------------------
    @classmethod
    def end_flyback(cls):
        print '\n'

    # Logging level - if logging level is less than the value then return True
    # Generic function to check logging levels for use in if statements
    # --------------------------------------------------------------------------
    @classmethod
    def logging_level(cls, level):
        # Do the set ones very quickly and return
        if level >= 100:
            return True
        elif level <= -1:
            return False

        # Now do the env vars stuff that involves lookups
        elif 'ADP_DEBUG_LEVEL' in os.environ \
        and level >= int(os.environ['ADP_DEBUG_LEVEL']):
                return True
        else:
            # Get the numeric level to compare against
            # Get the console_level from the env vars
            levels_dict = {'CRITICAL': 50, 'ERROR': 40, 'WARNING': 30, 'INFO': 20, 'DEBUG': 10}
            cls.get_console_log_level()
            numeric_level = levels_dict[cls.console_level]
            if level >= numeric_level:
                return True
            else:
                return False



# Class: FSUtils - Utilities for interacting with the filesystem/operating system
#===============================================================================
class FSUtils():
    log = LogUtils.create_logger('ADP.FSUtils')
    msg = LogUtils.message

    # Expand path to a fully reconciled path
    # --------------------------------------------------------------------------
    @classmethod
    def expand_path(cls, path):
        path = os.path.expandvars(path)
        path = os.path.expanduser(path)
        path = os.path.realpath(path)
        path = os.path.abspath(path)
        path = os.path.normpath(path)
        return path

    # Check if a directory exists
    # --------------------------------------------------------------------------
    @classmethod
    def exists_dir(cls, path):
        if os.path.isdir(path):
            if os.path.islink(path):
                cls.log.warning('Directory %s is a symbolic link' % path)
            else:
                cls.msg(4, 'D', 'FSUtils.exists_dir', 'Directory %s exists' % path)
            return True
        else:
            cls.msg(4, 'D', 'FSUtils.exists_dir', 'Directory %s does not exist' % path)
            return False

    # Delete a directory
    # --------------------------------------------------------------------------
    @classmethod
    def delete_dir_path(cls, path, force=False):
        if cls.exists_dir(path):
            try:
                if force:
                    shutil.rmtree(path)
                else:
                    os.removedirs(path)
                cls.msg(4, 'D', 'FSUtils.delete_dir_path', 'Path %s deleted' % path)
                return True
            except OSError, e:
                cls.log.error('Failed to delete directory %s with error message: %s'
                          % (path, e))
                return False
        else:
            cls.msg(4, 'D', 'FSUtils.delete_dir_path', 'Path %s does not exist' % path)
            return True

    # Check if a file exists
    # --------------------------------------------------------------------------
    @classmethod
    def exists_file(cls, filepath):
        if os.path.isfile(filepath):
            if os.path.islink(filepath):
                cls.log.debug('File %s is a symbolic link' % filepath)
            else:
                cls.msg(4, 'D', 'FSUtils.exists_file', 'File %s exists' % filepath)
            return True
        else:
            cls.msg(4, 'D', 'FSUtils.exists_file', 'File %s does not exist' % filepath)
            return False

    # Create a full directory path if it does not exist
    # --------------------------------------------------------------------------
    @classmethod
    def create_dir_path(cls, path):
        if not cls.exists_dir(path):
            try:
                os.makedirs(path)
                cls.msg(4, 'D', 'FSUtils.create_dir_path', 'Path %s created' % path)
                return True
            except OSError, e:
                cls.log.error('Failed to create directory %s with error message: %s'
                          % (path, e))
                return False
        else:
            cls.msg(4, 'D', 'FSUtils.create_dir_path', 'Path %s already exists' % path)
            return True

    # Copy a file from source to destination
    # --------------------------------------------------------------------------
    @classmethod
    def copy_file(cls, source_file, destination_file, overwrite=False):

        # First check that the source file exists and the destination file does not
        if not cls.exists_file(source_file):
            cls.log.error('Source file %s for copy does not exist' % source_file)
            return False

        if cls.exists_file(destination_file) and not overwrite:
            cls.log.debug('Destination file %s already exists - not overwriting' % destination_file)
            return False

        # Now go ahead with the copy
        try:
            shutil.copyfile(source_file, destination_file)
        except IOError, e:
            cls.log.error('Failed to copy file %s to %s with error message: %s'
                          % (source_file, destination_file, e))
            return False

        # Check it is there
        if cls.exists_file(destination_file):
            cls.msg(4, 'D', 'FSUtils.copy_file', 'File %s succesfully copied to %s'
                          % (source_file, destination_file))
            return True

    # Copy a files from source dir to destinationdir
    # --------------------------------------------------------------------------
    @classmethod
    def copy_files(cls, source_dir, destination_dir, overwrite=False, pattern=None):

        # Get a list of files in the source directory
        files_to_copy = cls.list_files(source_dir, pattern)

        # Copy each of the files
        for file_to_copy in files_to_copy:
            dst = os.path.join(destination_dir, os.path.basename(file_to_copy))
            cls.copy_file(file_to_copy, dst)

    # Check if a file is a text file
    # http://stackoverflow.com/questions/1446549/how-to-identify-binary-and-text-files-using-python
    # http://code.activestate.com/recipes/173220/
    # --------------------------------------------------------------------------
    @classmethod
    def check_file_is_text(cls, filepath):
        filechunk = open(filepath).read(512)
        text_characters = "".join(map(chr, range(32, 127)) + list("\n\r\t\b"))
        _null_trans = string.maketrans("", "")
        if not filechunk:
            # Empty files are considered text
            return True
        if "\0" in filechunk:
            # Files with null bytes are likely binary
            return False
        # Get the non-text characters (maps a character to itself then
        # use the 'remove' option to get rid of the text characters.)
        translated_chunk = filechunk.translate(_null_trans, text_characters)
        # If more than 30% non-text characters, then
        # this is considered a binary file
        if float(len(translated_chunk))/float(len(filechunk)) > 0.30:
            return False
        return True

    # Check if files are different
    # --------------------------------------------------------------------------
    @classmethod
    def check_files_differ(cls, file1, file2):

        fid1 = open(file1)
        fid2 = open(file2)
        diff = difflib.SequenceMatcher(None, fid1.read(), fid2.read())

        if diff.ratio() < 1.0:
            return True
        else:
            return False

    # Create an empty file
    # --------------------------------------------------------------------------
    @classmethod
    def create_file(cls, filename):
        fid = open(filename, 'w')
        fid.write('')
        fid.close()

    # Delete a file
    # --------------------------------------------------------------------------
    @classmethod
    def delete_file(cls, delete_file):

        # First check that the file to be deleted exists
        if cls.exists_file(delete_file):
            os.remove(delete_file)
            if not cls.exists_file(delete_file):
                cls.msg(4, 'D', 'FSUtils.delete_file', 'File %s deleted' % delete_file)
                return True
            else:
                cls.log.error('File %s not deleted' % delete_file)
                return False
        else:
            cls.log.debug('File %s to be deleted does not exist' % delete_file)
            return True

    # Look for a string in a file and return a list of lines containing it
    # --------------------------------------------------------------------------
    @classmethod
    def find_string_in_file(cls, check_file, findstring, any_case=True):
        ''' Find a string in a file '''

        matching_lines = list()

        check_fileid = open(check_file, 'r')
        for line in check_fileid:
            if any_case:
                if re.search(findstring, line, re.IGNORECASE):
                    matching_lines.append(line)
            else:
                if re.search(findstring, line):
                    matching_lines.append(line)

        return matching_lines

    # Find files in directory matching pattern
    # --------------------------------------------------------------------------
    @classmethod
    def find_files_in_dir(cls, directory, pattern):
        # Expand the directory path
        directory = cls.expand_path(directory)

        matching_files = list()
        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)
            if re.match(pattern, item) and os.path.isfile(item_path):
                matching_files.append(item_path)

        return matching_files

    # Find file upwards in hierarchy - look up through the hierarchy until we
    # find the named file
    # --------------------------------------------------------------------------
    @classmethod
    def find_file_upwards(cls, start_directory, filename):
        # Expand the directory path
        directory = cls.expand_path(start_directory)

        while directory != os.path.abspath(os.sep):
            if cls.exists_file(os.path.join(directory, 'ADP_config.yml')):
                return os.path.join(directory, 'ADP_config.yml')
            else:
                directory = os.path.dirname(directory)

        return None

    # List contents matching pattern
    # --------------------------------------------------------------------------
    @classmethod
    def list_contents(cls, directory, pattern=None):
        # Expand the directory path
        directory = cls.expand_path(directory)
        directories = list()

        if cls.exists_dir(directory):
            dir_files = os.listdir(directory)
        else:
            cls.log.error('Directory %s does not exist' % directory)
            return directories

        return_files = list()
        if pattern is not None:
            for dir_file in dir_files:
                if re.match(pattern, dir_file):
                    return_files.append(os.path.join(directory, dir_file))
        else:
            for dir_file in dir_files:
                return_files.append(os.path.join(directory, dir_file))

        return return_files

    # List files matching pattern
    # --------------------------------------------------------------------------
    @classmethod
    def list_files(cls, directory, pattern=None):
        # Expand the directory path
        directory = cls.expand_path(directory)
        directories = list()

        if cls.exists_dir(directory):
            dir_files = cls.list_contents(directory, pattern)
        else:
            cls.log.error('Directory %s does not exist' % directory)
            return directories

        file_files = list()
        for dir_file in dir_files:
            if os.path.isfile(dir_file):
                file_files.append(dir_file)
        return file_files

    # List directories matching pattern
    # --------------------------------------------------------------------------
    @classmethod
    def list_dirs(cls, directory, pattern=None, fullpath=True):
        # Expand the directory path
        directory = cls.expand_path(directory)
        directories = list()

        if cls.exists_dir(directory):
            dir_files = cls.list_contents(directory, pattern)
        else:
            cls.log.error('Directory %s does not exist' % directory)
            return directories

        directories = list()
        for dir_file in dir_files:
            if os.path.isdir(dir_file):
                if fullpath:
                    directories.append(dir_file)
                else:
                    directories.append(os.path.basename(dir_file))
        return directories

    # List directories with specified content
    # --------------------------------------------------------------------------
    @classmethod
    def list_dirs_with_content(cls, directory, required_content, fullpath=True, hiermax=100, hiermin=0):
        LogUtils.message(2, 'D', 'list_dirs_with_content', 'Entering method - list_dirs_with_content: %s' % directory)
        # Expand the directory path
        directory = cls.expand_path(directory)
        directories = list()


        if not cls.exists_dir(directory):
            cls.log.error('Directory %s does not exist' % directory)
            return directories

        for path, dirs, files in os.walk(directory):
            LogUtils.message(2, 'D', 'list_dirs_with_content', 'Path: %s Dirs: %s Files: %s' % (path, dirs, files))
            files_dirs = files + dirs

            # Only look as deep as requested
            level = path.replace(directory, '').count(os.sep)
            LogUtils.message(2, 'D', 'list_dirs_with_content', 'Level: %s Hiermax: %s' % (level, hiermax))
            if level > hiermax:
                # Don't go any deeper - replace dirs in place using slicing
                dirs[:] = []
            if level < hiermin:
                continue

            # Check to see if we have the required_content
            missing = False
            for req_content in required_content:
                if not PyUtils.find_pattern_match_in_list(req_content, files_dirs):
                    missing = True
                    break
            if not missing:
                if fullpath:
                    directories.append(path)
                else:
                    directories.append(path.replace(directory+'/', ''))
        return directories

    # Link files matching pattern
    # --------------------------------------------------------------------------
    @classmethod
    def link_file(cls, source, link_directory, pattern=None):
        # Expand the directory path
        link_directory = cls.expand_path(link_directory)

        destination_file = os.path.join(link_directory, os.path.basename(source))

        if not cls.exists_file(source):
            cls.log.error('File %s does not exist' % source)
        elif cls.exists_file(destination_file):
            cls.log.debug('File %s already exists' % destination_file)
        else:
            cwd = os.getcwd()
            os.chdir(link_directory)
            os.symlink(source, os.path.basename(source))
            os.chdir(cwd)

    # Link files matching pattern
    # --------------------------------------------------------------------------
    @classmethod
    def link_files(cls, source, link_directory, pattern=None):
        # Expand the directory path
        link_directory = cls.expand_path(link_directory)

        if cls.exists_dir(source):
            dir_files = cls.list_contents(source, pattern)
        else:
            cls.log.error('Directory %s does not exist' % source)

        cwd = os.getcwd()
        os.chdir(link_directory)
        for dir_file in dir_files:
            if os.path.isfile(dir_file):
                os.symlink(dir_file, os.path.basename(dir_file))
        os.chdir(cwd)


    # Run system command
    # --------------------------------------------------------------------------
    @classmethod
    def run_system_command(cls, command):
        process = subprocess.Popen(command, shell=True,
                                   stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        process.wait()
        return process.returncode


# Class: PyUtils - Utilities for interacting with Python - common subroutines etc.
#===============================================================================
class PyUtils():
    log = LogUtils.create_logger('ADP.PyUtils')


    # Unique extend of list - only add the elements of list2 that are not in list1 already
    #---------------------------------------------------------------------------
    @classmethod
    def extend_list_uniquely(cls, master_list, add_list):

        return_list = copy.deepcopy(master_list)
        for element in add_list:
            if element not in return_list:
                return_list.append(element)

        return return_list


    # Get module path
    # --------------------------------------------------------------------------
    @classmethod
    def get_module_path(cls, module_spec):

        module = importlib.import_module(module_spec)
        if hasattr(module, '__file__'):
            module_path = os.path.dirname(module.__file__)
            module_path = FSUtils.expand_path(module_path)
            cls.log.debug('Module %s path is %s' % (module_spec, module_path))
        else:
            cls.log.error('Module %s seems to be malformed - no associated file' % module_spec)
            module_path = None
        return module_path

    # Convert a comma separted pair to a complex string
    #---------------------------------------------------------------------------
    @classmethod
    def convert_comma_pair_to_complex_str(cls, comma_pair):

        comma_list = comma_pair.split(',')
        if comma_list[1].startswith('-'):
            complex_str = '%s%sj' % (comma_list[0], comma_list[1])
        else:
            complex_str = '%s+%sj' % (comma_list[0], comma_list[1])
        return complex_str

    # Convert a comma separated string to a list
    #---------------------------------------------------------------------------
    @classmethod
    def convert_csvstring_to_list(cls, csvstring):

        return_list = csvstring.split(",")
        for element, index in enumerate(return_list):
            if isinstance(element, str):
                return_list[index] = element.strip()

        return return_list

    # Convert a space separated string to a list
    #---------------------------------------------------------------------------
    @classmethod
    def convert_space_string_to_list(cls, space_string):

        return_list = space_string.split()
        for element, index in enumerate(return_list):
            if isinstance(element, str):
                return_list[index] = element.strip()

        return return_list

    # Convert a list to a comma separated string
    #---------------------------------------------------------------------------
    @classmethod
    def convert_list_to_csvstring(cls, in_list, include_space=True):

        if include_space:
            return_string = ', '.join(in_list)
        else:
            return_string = ','.join(in_list)

        return return_string


    # Remove one list from another
    # --------------------------------------------------------------------------
    @classmethod
    def remove_list_from_list(cls, master_list, remove_list):
        for item in remove_list:
            if item in master_list:
                master_list.remove(item)
            else:
                cls.log.debug('Item %s is not in master list' % (item))
        return master_list

    # Remove one list from another
    # --------------------------------------------------------------------------
    @classmethod
    def replace_in_list(cls, master_list, search_obj, replace_obj):

        # Create a new list so we leave the original unmodified
        return_list = list()
        for index, item in enumerate(master_list):
            if item == search_obj:
                return_list.append(copy.deepcopy(replace_obj))
            else:
                return_list.append(item)
        return return_list

    # Remove duplicates in list (preserving order of first occurrence)
    # --------------------------------------------------------------------------
    @classmethod
    def remove_duplicates_in_list(cls, master_list):

        return_list = list()

        for item in master_list:
            if item not in return_list:
                return_list.append(item)

        return return_list

    # Find if an integer is even
    # --------------------------------------------------------------------------
    @classmethod
    def is_even(cls, integer):
        if integer%2 == 0:
            return True
        else:
            False

    # Find if an integer is odd
    # --------------------------------------------------------------------------
    @classmethod
    def is_odd(cls, integer):
        if integer%2 == 1:
            return True
        else:
            False

    # List replace
    # --------------------------------------------------------------------------
    @classmethod
    def replace_list(cls, listobject, old, new):
        for index, item in enumerate(listobject):
            if isinstance(item, str):
                listobject[index] = item.replace(old, new)
            elif re.match(old, item):
                listobject[index] = new
        return listobject

    # Find pattern match in a list
    # --------------------------------------------------------------------------
    @classmethod
    def find_pattern_match_in_list(cls, pattern, target_list):
        for target in target_list:
            if re.match(pattern, target):
                return True

        return False

    # Single quoted string
    # --------------------------------------------------------------------------
    @classmethod
    def quoted_string1(cls, string):
        return "'" + string + "'"

    # Timestamp
    # --------------------------------------------------------------------------
    @classmethod
    def timestamp(cls, timeformat='timestamp1'):
        if timeformat == 'timestamp1':
            timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        elif timeformat == 'file_timestamp':
            timestamp = time.strftime('%Y%m%d%H%M%S')
        elif timeformat == 'year':
            timestamp = time.strftime('%Y')
        else:
            cls.log.warning('Unknown time format')
        return timestamp


# Class: ADPUtils - Utilities for interacting with the ADP environment
#===============================================================================
class ADPUtils():
    lu = LogUtils
    log = lu.create_logger('ADP.ADPUtils')

    # Get the libname from lcv
    # --------------------------------------------------------------------------
    @classmethod
    def get_libname_from_lcv(cls, lcv):
        lcv = lcv.lstrip('/')
        split_list = lcv.split('/')
        return split_list[0]

    # Get the cellname from lcv
    # --------------------------------------------------------------------------
    @classmethod
    def get_cellname_from_lcv(cls, lcv):
        lcv = lcv.lstrip('/')
        split_list = lcv.split('/')
        return split_list[1]

    # Get the libname from lcv
    # --------------------------------------------------------------------------
    @classmethod
    def get_viewname_from_lcv(cls, lcv):
        lcv = lcv.lstrip('/')
        split_list = lcv.split('/')
        return split_list[2]

    # Get the libname from lcv
    # --------------------------------------------------------------------------
    @classmethod
    def get_lcv_from_tuple(cls, libname, cellname, viewname):
        lcv = '/'.join([libname, cellname, viewname])
        return lcv

    # Get unique library names from lcv list
    # --------------------------------------------------------------------------
    @classmethod
    def get_unique_libnames_from_lcvlist(cls, lcv_list):
        libnames = list()
        for lcv in lcv_list:
            libname = cls.get_libname_from_lcv(lcv)
            if libname not in libnames:
                libnames.append(libname)

        return libnames

    # Get unique cell names from lcv list
    # --------------------------------------------------------------------------
    @classmethod
    def get_unique_cellnames_from_lcvlist(cls, libname, lcv_list):
        cellnames = list()
        for lcv in lcv_list:
            lcv_libname = cls.get_libname_from_lcv(lcv)
            cellname = cls.get_cellname_from_lcv(lcv)
            if lcv_libname == libname:
                if cellname not in cellnames:
                    cellnames.append(cellname)

        return cellnames

    # Get unique view names from lcv list
    # --------------------------------------------------------------------------
    @classmethod
    def get_unique_viewnames_from_lcvlist(cls, libname, cellname, lcv_list):
        viewnames = list()
        for lcv in lcv_list:
            lcv_libname = cls.get_libname_from_lcv(lcv)
            lcv_cellname = cls.get_cellname_from_lcv(lcv)
            viewname = cls.get_viewname_from_lcv(lcv)
            if lcv_libname == libname:
                if lcv_cellname == cellname:
                    if viewname not in viewnames:
                        viewnames.append(viewname)

        return viewnames

    # Convert to Python notation
    # --------------------------------------------------------------------------
    @classmethod
    def convert_to_python_notation(cls, path):
        path.lstrip('/')
        return path.replace('/', '.')

    # Convert to path notation
    # --------------------------------------------------------------------------
    @classmethod
    def convert_to_path_notation(cls, path):
        path.lstrip('/')
        return path.replace('.', '/')


    # Get the ADP configuration
    # --------------------------------------------------------------------------
    @classmethod
    def get_adp_config(cls):

        cls.get_adp_configfile()
        if cls.configfile != 'NotFound':
            cls.config_data = yaml.load(open(cls.configfile, 'r'))
            return cls.config_data
        else:
            cls.log.critical('No ADP config file was found - returning an empty dictionary')
            return dict()

    # Write the ADP configuration
    # --------------------------------------------------------------------------
    @classmethod
    def write_adp_config(cls, config_data):

        cls.get_adp_configfile_destination()
        if cls.configfile_dest != 'NotFound':
            # Hate this - overcomes recursive import issue
            from misc.yaml_writer import YAML
            YAML.yaml_write(config_data,
                            cls.configfile_dest,
                            ['Process', 'Simulation', 'RootDir', 'Foundry', 'Simulator', 'NoThreads'],
                            heading_depth=1)
        else:
            cls.log.critical('No ADP config destination file was found')
            sys.exit(0)

    # Copy the ADP configuration
    # --------------------------------------------------------------------------
    @classmethod
    def copy_adp_config(cls):

        config_data = cls.get_adp_config()
        cls.write_adp_config(config_data)


    # Find the destination for the ADP_config file.
    # --------------------------------------------------------------------------
    @classmethod
    def get_adp_configfile_destination(cls):

        if 'ADP_CONFIG' in os.environ:
            cls.configfile_dest = FSUtils.expand_path(os.environ['ADP_CONFIG'])
        elif 'ADP_CONFIG_DEFAULT' in os.environ:
            cls.configfile_dest = FSUtils.expand_path(os.environ['ADP_CONFIG_DEFAULT'])
        else:
            cls.configfile_dest = 'NotFound'
            cls.log.error('Unable to find an ADP config destination file - no ADP_CONFIG/ADP_CONFIG_DEFAULT')


    # Find the ADP_config.yml file
    # --------------------------------------------------------------------------
    @classmethod
    def get_adp_configfile(cls):

        # There are three modes of use for ADP:
        #   1. Generation - expect to find ADP_config in the library
        #   2. Developer  - expect to find ADP_config in the cell
        #   3. Testing    - expect to find ADP_config in the testing directory
        # Path to expected location is in ADP_CONFIG_DEFAULT

        # We are going to start by looking for the env var ADP_CONFIG and using that
        # Then we are going to look in the ADP_CONFIG_DEFAULT directory - the default place to find the config file
        # Must be in one of these two places

        # # # # # # Then look in the current working directory - do not do this
        # # # # # # Then look in the home directory - do not do this

        # If not found then copy from these locations
        # Then look in the ADP_CONFIG_SITE directory - to get the standard site config file
        # Then get it from the ADP misc directory
        # Then we'll just give up defeated ...

        # DEPRECATED - Then we are going to look in the ADP_PROJECT directory
        # if 'ADP_PROJECT' in os.environ:
        #     cls.lu.message(2, 'D', 'get_adp_configfile', 'ADP_PROJECT env var no longer used')

        # We are going to start by looking for the env var ADP_CONFIG and using that
        if 'ADP_CONFIG' in os.environ:
            cls.configfile = FSUtils.expand_path(os.environ['ADP_CONFIG'])
            if FSUtils.exists_file(cls.configfile):
                cls.lu.message(2, 'D', 'get_adp_configfile', 'Using config file: %s' % cls.configfile)
                return

        # Then we are going to look in the env var ADP_CONFIG_DEFAULT and use that
        if 'ADP_CONFIG_DEFAULT' in os.environ:
            cls.configfile = FSUtils.expand_path(os.environ['ADP_CONFIG_DEFAULT'])
            if FSUtils.exists_file(cls.configfile):
                cls.lu.message(2, 'D', 'get_adp_configfile', 'Using config file: %s' % cls.configfile)
                return

        # # # # # Then look in the current working directory
        # # # # cls.configfile = FSUtils.expand_path(os.path.join(os.getcwd(), 'ADP_config.yml'))
        # # # # if FSUtils.exists_file(cls.configfile):
        # # # #         cls.lu.message(2, 'D', 'get_adp_configfile', 'Using config file: %s' % cls.configfile)
        # # # #         return
        # # # #
        # # # # # Then look in the home directory
        # # # # cls.configfile = FSUtils.expand_path(os.path.join('~', 'ADP_config.yml'))
        # # # # if FSUtils.exists_file(cls.configfile):
        # # # #         cls.lu.message(2, 'D', 'get_adp_configfile', 'Using config file: %s' % cls.configfile)
        # # # #         return

        # Then we are going to look in the env var ADP_CONFIG_SITE and use that
        if 'ADP_CONFIG_SITE' in os.environ:
            cls.configfile = FSUtils.expand_path(os.environ['ADP_CONFIG_SITE'])
            if FSUtils.exists_file(cls.configfile):
                cls.lu.message(2, 'D', 'get_adp_configfile', 'Using config file: %s' % cls.configfile)
                return

        # Then use the default ADP config in the misc directory
        this_dir = os.path.dirname(__file__)
        cls.configfile = FSUtils.expand_path(os.path.join(this_dir, 'ADP_config.yml'))
        if FSUtils.exists_file(cls.configfile):
            cls.lu.message(2, 'D', 'get_adp_configfile', 'Using config file: %s' % cls.configfile)
            return

        # Then we'll just give up defeated ...
        cls.log.error('Unable to find an ADP config file - one must be defined')
        cls.configfile = 'NotFound'

    # Get the ADP process directory - spcialist method for key data
    # --------------------------------------------------------------------------
    @classmethod
    def get_adp_processdir(cls):

        cls.get_adp_config()
        return FSUtils.expand_path(cls.config_data['Process']['Root_Dir'])

    # Get the ADP process - spcialist method for key data
    # --------------------------------------------------------------------------
    @classmethod
    def get_adp_process(cls):

        cls.get_adp_config()
        foundry = cls.config_data['Process']['Foundry']
        process_node = cls.config_data['Process']['ProcessNode']
        process_variant = cls.config_data['Process']['ProcessVariant']
        process_name = '%s.%s.%s.ADP' % (foundry, process_node, process_variant)
        return process_name

    # Get the ADP simulator - spcialist method for key data
    # --------------------------------------------------------------------------
    @classmethod
    def get_adp_simulator(cls):

        cls.get_adp_config()
        return cls.config_data['Simulation']['Simulator']

    # Get ADP config value
    # --------------------------------------------------------------------------
    @classmethod
    def get_adp_configvalue(cls, section_string):

        cls.get_adp_config()
        query_expression = 'cls.config_data' + section_string
        return eval(query_expression)

# Class: UIUtilt - user interface utilities
#===============================================================================
class UIUtils():
    lu = LogUtils
    log = lu.create_logger('ADP.UIUtils')

    # Ask a yes/no question with a default answer
    # --------------------------------------------------------------------------
    @classmethod
    def question_yesno(cls, question, default=None, validation=False):

        # Check the default we got passed default must by y or n
        # - do some pre-processing
        if default is not None:
            default = default[0].lower()
            if default not in ['y', 'n']:
                default = None

        # Keep asking until we get a valid answer
        answer = ''
        while answer == '':
            # Ask the question
            if default == None:
                answer = raw_input('%s? [y/n]: ' % question)
            else:
                answer = raw_input('%s? [y/n] (default=%s): ' % (question, default))
            # Process the answer
            if len(answer) > 0:
                answer = answer[0].lower()
                if answer not in ['y', 'n']:
                    print 'You must answer either y or n'
                    answer = ''
            else:
                if default is not None:
                    answer = default
                else:
                    print 'You must answer either y or n'
                    answer = ''

        # Return
        if validation:
            print 'You chose: %s' % answer
        if answer == 'y':
            return True
        else:
            return False

    # Ask a value question  - with suggested default
    # --------------------------------------------------------------------------
    @classmethod
    def question_value(cls, question, default=None, validate=False):

        # Keep asking until we get a valid answer
        answer = ''
        while answer == '':
            # Ask the question
            if default == None:
                answer = raw_input('%s: ' % question)
            else:
                answer = raw_input('%s (default=%s): ' % (question, default))
            # Process the answer
            if len(answer) == 0:
                if default is not None:
                    answer = default
                else:
                    print 'You must provide an answer'
                    answer = ''
            # Validation
            if validate:
                yn_question = '   You entered %s - is this correct' % answer
                if not cls.question_yesno(yn_question, default='y'):
                    answer = ''
        # Return
        return answer


    # Ask a choice question - offer the user a list of choices and ask them to choose
    # offer a default
    # --------------------------------------------------------------------------
    @classmethod
    def question_choice(cls, question, choices, default=None, other=False, validate=False):

        # Add other to the list of choices
        if other:
            choices.append('Other ...')

        # Keep asking until we get a valid answer
        answer = ''
        while answer == '':
            # Ask the question
            if default == None:
                print '%s: ' % question
            else:
                print '%s (default=%s): ' % (question, default)
            for index, value in enumerate(choices):
                print '  %3s:  %s' % (index+1, value)

            if default is None:
                answer = raw_input('Please enter a number between 1 and %s: ' % (index+1))
            else:
                answer = raw_input('Please enter a number between 1 and %s (default=%s): ' % (index+1, default))

            # Process the answer
            if len(answer) == 0:
                if default is not None:
                    answer = default
                else:
                    print 'You must provide a number in the range 1-%s' % (index+1)
                    answer = ''
            try:
                answer = int(answer)
                if answer not in range(1, index+2):
                    print 'You must provide a number in the range 1-%s' % (index+1)
                    answer = ''

                # Handle other
                if answer == index+1 and other:
                    val_question = 'What is your alternate value'
                    real_answer = cls.question_value(val_question, validate=validate)
                    return real_answer

                # Validation
                elif validate:
                    yn_question = '   You entered %s:  %s - is this correct' % (answer, choices[answer-1])
                    if not cls.question_yesno(yn_question, default='y'):
                        answer = ''

            except NameError:
                print 'You must enter a number in the range 1-%s' % (index+1)
                answer = ''
            except ValueError:
                print 'You must enter a number in the range 1-%s' % (index+1)
                answer = ''

        # Return
        real_answer = choices[answer-1]
        return real_answer





#===============================================================================
# MAIN SECTION
#===============================================================================

#def add(int1, int2):
#    log.info('Call to add')
#    return int1+int2
#
#
#def sub(int1, int2):
#    log.info('Call to sub')
#    return int1-int2
#
## Class: maths
##===============================================================================
#class maths():
#    log = LogUtils.create_logger('ADP.maths')
#
#    @classmethod
#    def add(cls, int1, int2):
#        cls.log.info('Call to maths.add')
#        return int1+int2
#
#
#    def sub(self, int1, int2):
#        self.log.info('Call to maths.sub')
#        return int1-int2
#
#
## Setup logger (done on import)
## ------------------------------------------------------------------------------
#log = LogUtils.create_logger('ADP.basic')

#=============================== END OF FILE ===================================
#===============================================================================
