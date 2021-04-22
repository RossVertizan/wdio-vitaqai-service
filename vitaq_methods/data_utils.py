#!/usr/bin/env python


# Standard Python imports
#-------------------------------------------------------------------------------
#from profilehooks import profile
#from scipy import interpolate as sci_int
#from scipy import optimize as sci_opt
import itertools
import math
#import numpy as np
import operator
import os
import re
import shutil
import sys


# Vertizan imports
#-------------------------------------------------------------------------------
from basic_utils import LogUtils as lu
from basic_utils import PyUtils as pu
from basic_utils import FSUtils as fsu

#===============================================================================
# CLASSES AND METHODS
#===============================================================================


# Class:
#===============================================================================
class ArrayUtils():

    log = lu.create_logger('VTQ.arrayUtils')
    # NOTE: Printing arrays is expensive - do so only for debugging
    # This is why message functions pass a list of args which are evaluated in
    # the message method when we know they will be printed. (e.g. 'A:%s B:%s', a, b)
    # It avoids the conversion of arrays to strings which happens as soon as
    # we pass them as arguments if we use the (e.g. 'A:%s B:%s' % (a, b))

    # Take any number of arguments and create an array by stacking horizontally
    #---------------------------------------------------------------------------
    @classmethod
    def array_hstack(cls, *args):
        lu.message(1, 'D', 'array_hstack', 'Args: %s', list(args))

        # ans is None to start with
        ans = None
        for arg in args:
            if arg is not None:
                # Create an array with the data
                array_arg = np.array(arg)
                # lu.message(1, 'D', 'array_hstack', 'Arg: %s', arg)
                # lu.message(2, 'D', 'array_hstack', 'Array shape: %s', np.shape(array_arg))

                # If the array is not at least 2-dimensional, then re-form it
                # as a 2d array
                if len(np.shape(array_arg)) < 2:
                    array_arg = np.array([arg])

                # Formulate the answer - if ans is not None then create an hstack
                if ans is None:
                    ans = array_arg
                else:
                    ans = np.hstack((ans, array_arg))

        lu.message(1, 'D', 'array_hstack', 'Ans: %s', list(ans))
        return ans


    # Take any number of arguments and create an array by stacking vertically
    #---------------------------------------------------------------------------
    @classmethod
    def array_vstack(cls, *args):
        lu.message(1, 'D', 'array_vstack', 'Args: %s', list(args))

        # ans is None to start with
        ans = None
        for arg in args:
            if arg is not None:
                # Create an array with the data
                array_arg = np.array(arg)

                # If the array is not at least 2-dimensional, then re-form it
                # as a 2d array
                if len(np.shape(array_arg)) < 2:
                    array_arg = np.array([arg])

                # Formulate the answer - if ans is not None then create a vstack
                if ans is None:
                    ans = array_arg
                else:
                    ans = np.vstack((ans, array_arg))

        lu.message(1, 'D', 'array_vstack', 'Ans: %s', list(ans))
        return ans

    # Get the minimum values in all the columns
    #---------------------------------------------------------------------------
    @classmethod
    def array_mincolumn_values(cls, in_array):

        # Get the minimum value from each column and convert it to a
        # single column array
        return np.array([in_array.min(1)]).T

    # Get the maximum values in all the columns
    #---------------------------------------------------------------------------
    @classmethod
    def array_maxcolumn_values(cls, in_array):

        # Get the maximum value from each column and convert it to a
        # single column array
        return np.array([in_array.max(1)]).T

    # array_decade - return list of points on a log (decade) scale - returns ndarray
    #---------------------------------------------------------------------------
    @classmethod
    def array_decade(cls, start, stop, points_per_decade):
        # log spaced points between start and stop with npdec per decade.
        step = 1.0/points_per_decade
        points = np.arange(np.log10(start), np.log10(stop)+step, step)
        return np.power(10, points)

    # array_convert_list
    #---------------------------------------------------------------------------
    @classmethod
    def array_convert_list(cls, data):
        if not isinstance(data, list):
            cls.log.error('Data must be a list - not converting: %s' % type(data))
            return data
        else:
            array = np.array(data).reshape(len(data), 1)
            return array

    # array_make2d - make sure there is at least one column
    #---------------------------------------------------------------------------
    @classmethod
    def array_make2d(cls, data):
        if isinstance(data, list):
            return cls.array_convert_list(data)
        elif not isinstance(data, np.ndarray):
            cls.log.error('Data must be an ndarray - not converting: %s' % type(data))
            return data
        else:
            if len(np.shape(data)) == 1:
                rows = np.shape(data)[0]
                #cols = np.shape(data)[1]
                if rows:
                    array = np.reshape(data, (rows, 1))
                    return array
                #elif cols:
                #    array = np.reshape(data, (1, cols))
                #    return array
            else:
                return data

    # array_where_to_list - convert output of where to tuple
    #---------------------------------------------------------------------------
    @classmethod
    def array_where_to_list(cls, where_output):

        indices = list()
        for index in range(len(where_output)):
            indices.append(where_output[index][0])
        return indices

    # Read an ASCII nutmeg file
    #---------------------------------------------------------------------------
    @classmethod
    def read_nutmeg(cls, nutmeg_file):
        # Return is a list of numpy arrays and a list of labels in the order
        # they appear in the columns of the array
        is_complex = False

        # First check that the file exists
        # - if not issue a message and return None
        if not fsu.exists_file(nutmeg_file):
            cls.log.error('Nutmeg file does not exist: %s' % nutmeg_file)
            return (None, None)

        # Next get the separate parts
        # Initialise some stuff
        data_lines = list()
        number_points = None
        number_variables = None
        variables = list()

        # Read in the file, format each line and parse the data
        nutmeg_fid = open(nutmeg_file, 'r').readlines()
        in_values = False
        in_variables = False
        for line in nutmeg_fid:

            # Extract the number of points
            # For operating point simulations Spectre prints the number of
            # points as zero- of course there is one.
            if line.startswith('No. Points'):
                line = line.replace('\t', ' ').strip()
                number_points = int(line.split()[-1])
                if number_points == 0:
                    number_points = 1

            # Get the flags entry
            elif line.startswith('Flags'):
                line = line.replace('\t', ' ').strip()
                flags = line.replace('Flags: ', '').strip()
                if re.search('complex', flags):
                    is_complex = True

            # Extract the number of variables
            elif line.startswith('No. Variables'):
                line = line.replace('\t', ' ').strip()
                number_variables = int(line.split()[-1])

            # Set the flag for the values section
            elif line.startswith('Values:'):
                in_values = True
                in_variables = False

            # Set the flag for the variables section
            elif line.startswith('Variables:'):
                in_variables = True
                in_values = False
                line = line.replace('\t', ' ').strip()
                variables.append(line)

            # Get the values
            elif in_values:
                data_lines.append(line)

            # Get the variables
            elif in_variables:
                line = line.replace('\t', ' ').strip()
                variables.append(line)

        # Now hand off further parsing to other methods
        data_array = cls.parse_nutmeg_values(data_lines, number_variables,
                                             number_points, is_complex)
        data_labels = cls.parse_nutmeg_variables(variables)

        return(data_array, data_labels)

    # Parse nutmeg values sections
    #---------------------------------------------------------------------------
    @classmethod
    def parse_nutmeg_values(cls, data_lines, number_variables, number_points, is_complex):

        # Example data:
        # Values:
        # 0	0	0	1.8
        #    0	0.487066677550019	0.631949182004205
        #    2.70863340175102e-19	0.00643438161174207	-0
        #    1.8	0
        # 1	0.01	6.36445437737938e-05	1.8
        #    0.01	0.487048492598881	0.631952364902299
        #    2.15419951025364e-05	0.00629499951880035	6.36445437537938e-05
        #    1.8	0.01
        # 2	0.02	0.000125909311237876	1.8
        #    0.02	0.487030307647742	0.631955547697761
        #    4.3373684181763e-05	0.00615841375746326	0.000125909311197876
        #    1.8	0.02

        # Parse the values section
        # We are going to make a list of lists with an entry for each datapoint
        # Use the fact that continuation lines appear to start with a tab (hope this holds true)
        # Also check the datapoint index
        # Also count the number of variables recovered
        datapoint_index = 0
        datapoint_line = list()
        parsed_data = list()
        for line in data_lines:
            strip_line = line.strip()

            # Is this a continuation line ?
            if line.startswith('\t'):
                mod_line = line.replace('\t', ' ').strip()
                datapoint_line.extend(mod_line.split())

            # or a start line
            elif strip_line.startswith(str(datapoint_index)):
                if datapoint_index == 0:
                    datapoint_line = strip_line.split()
                elif len(datapoint_line) == (number_variables):
                    parsed_data.append(datapoint_line)
                    datapoint_line = strip_line.split()
                else:
                    cls.log.warning('Possible parse errors')
                    parsed_data.append(datapoint_line)
                    datapoint_line = strip_line.split()
                # Get rid of the datapoint value
                datapoint_line.pop(0)
                datapoint_index = datapoint_index + 1

            else:
                cls.log.warning('A data line is either a start line or a continuation line')

        # Append the last line
        parsed_data.append(datapoint_line)



        # Create the list of arrays
        # Columns is a list of single column arrays, one column for each label
        if is_complex:
            columns = [
                np.array(
                    [[
                        complex(pu.convert_comma_pair_to_complex_str(
                            parsed_data[row_number][column_number]))
                            for row_number in range(number_points)
                    ]]
                ).T for column_number in range(number_variables)
            ]
        else:
            columns = [
                np.array(
                    [[
                        float(parsed_data[row_number][column_number])
                            for row_number in range(number_points)
                    ]]
                ).T for column_number in range(number_variables)
            ]

        return columns


    # Parse nutmeg variables section
    #---------------------------------------------------------------------------
    @classmethod
    def parse_nutmeg_variables(cls, variables):

        # Create the list of values
        column_labels = list()
        for line in variables:
            split_line = line.split()

            # Is this the first line
            if split_line[0] == 'Variables:':
                # Does it just have the title or data as well ?
                if len(split_line) == 1:
                    pass
                else:
                    standard_unit = cls.standardise_nutmeg_units(split_line[3], 'X')
                    column_labels.append(['X', standard_unit])
            else:
                standard_unit = cls.standardise_nutmeg_units(split_line[2], split_line[1])
                column_labels.append([split_line[1], standard_unit])

        return column_labels

    # Fix a nutmeg file - add a space after the 'Variables' keyword
    # --------------------------------------------------------------------------
    @classmethod
    def fix_nutascii_file(cls, nutmeg_file):

        nutmeg = open(nutmeg_file)
        run_dir = os.path.dirname(nutmeg_file)
        tmp_file = os.path.join(run_dir, 'tempFile')
        tmp = open(tmp_file, 'w')

        for line in nutmeg:
            if line.startswith('Variables:'):
                if len(line.split()) > 1:
                    line = line.replace('Variables:', 'Variables:\n        ')
            tmp.write(line)
        tmp.close()
        nutmeg.close()
        shutil.copy2(tmp_file, nutmeg_file)

    # Method to change a specified column to standardised steps
    # Normally the column will be the first (X-column)
    # --------------------------------------------------------------------------
    @classmethod
    #@profile(filename='rebase_array_axis.profile')
    def rebase_array_axis(cls, data_array, step, start=0, x_column=0 ):

        # This takes a list of numpy arrays as returned by read_nutmeg
        # Rebases them and returns a list of numpy arrays

        # # First of all get a list of the indices for the data columns
        # data_indices = range(len(data_array))
        # data_indices.pop(x_column)

        # Check the min step in the x_column
        x_data = data_array[x_column][...,0]
        prev_point = None
        smallest_step = None
        for point in x_data:
            if prev_point is None:
                prev_point = point
            elif smallest_step is None:
                smallest_step = point - prev_point
            elif smallest_step > (point - prev_point):
                smallest_step = point - prev_point
        if step > smallest_step:
            cls.log.warning('The requested step (%s) is greater than the smallest step in the data (%s) - resolution will be degraded'
                        % (step, smallest_step))

        # Go ahead with the step provided by the user.
        return_data = list()
        for data_index in range(len(data_array)):
            if data_index == x_column:
                return_data.append(
                    np.array([[
                        xstep for xstep in np.arange(start, x_data[-1], step)
                            ]]).T
                    )
            else:
                function = sci_int.interp1d(data_array[x_column][...,0], data_array[data_index][...,0])
                return_data.append(
                    np.array([[
                        function(xstep) for xstep in np.arange(start, x_data[-1], step)
                            ]]).T
                    )

        # # Insert the x-data
        # return_data.insert(x_column,
        #         np.array([[
        #             tstep for tstep in np.arange(start, x_data[-1], step)
        #                 ]])
        #         )

        return return_data


    # Print tabular data
    # --------------------------------------------------------------------------
    @classmethod
    def print_tabular_data(self, voltages=None, currents=None, model=None, \
                           index_min=0, index_max=0, x_min=None, x_max=None, x=None,\
                           label='', makeXreal=True):

        # Return if we got no data
        if voltages is None and current is None and model is None:
            lu.message(50, 'N', 'print_tabular_data', 'No data provided fpr voltages, currents or model')
            return

        if makeXreal and x is not None:
            x = np.real(x)

        # Print the header
        space = ' '*18
        print '='*80
        print '='*80
        lu.message(50, 'TN', 'print_tabular_data', 'TABULAR DATA: %s', label)

        # Sort out the elements we are printing
        if x_min is not None and x_max is not None and x is not None:
            index_min = np.argmax(x>=x_min)
            index_max = np.argmax(x>=x_max)
        else:
            index_max = index_max+1


        # Print the voltages
        if voltages is not None and len(voltages) > 0:
            lu.message(50, 'HN', 'print_tabular_data', 'VOLTAGES')
            for key in voltages:
                sys.stdout.write('%15s:  ' % key)
                space = ''
                for index in range(index_min, index_max):
                    if x is not None:
                        print '{}{: <15}  {: }'.format(space, x[index][0], voltages[key][index][0])
                    else:
                       print '{}{: }'.format(space, voltages[key][index][0])
                    space = ' '*18

        # Print the currents
        if currents is not None and len(currents) > 0:
            lu.message(50, 'HN', 'print_tabular_data', 'CURRENTS')
            for key in currents:
                sys.stdout.write('%15s:  ' % key)
                space = ''
                for index in range(index_min, index_max):
                    if x is not None:
                        print '{}{: <15}  {: }'.format(space, x[index][0], currents[key][index][0])
                    else:
                       print '{}{: }'.format(space, currents[key][index][0])
                    space = ' '*18

        # Print the model parameters
        if model is not None and len(model) > 0:
            lu.message(50, 'HN', 'print_tabular_data', 'MODEL')
            for key in model:
                for parameter in model[key]:
                    key_param = '%s:%s' % (key, parameter)
                    sys.stdout.write('%15s:  ' % key_param)
                    space = ''
                    for index in range(index_min, index_max):
                        if x is not None:
                            print '{}{: <15}  {: }'.format(space, x[index][0], model[key][parameter][index][0])
                        else:
                            print '{}{: }'.format(space, model[key][parameter][index][0])
                        space = ' '*18

        # Finish
        print '='*80
        print '='*80



# Class: EngUtils - engineering functions for manipulationg various numbers
#===============================================================================
class EngUtils():

    log = lu.create_logger('VTQ.EngUtils')

    # Snap a number (x) to the nearest grid (dx) value
    #---------------------------------------------------------------------------
    @classmethod
    def snap(cls, x, dx):
        return dx*np.round(float(x)/dx)

    # Snap a number (x) UP to the nearest grid (dx) value
    #---------------------------------------------------------------------------
    @classmethod
    def snap_up(cls, x, dx):
        return dx*np.ceil(float(x)/dx)

    # Snap a number (x) DOWN to the nearest grid (dx) value
    #---------------------------------------------------------------------------
    @classmethod
    def snap_down(cls, x, dx):
        return dx*np.floor(float(x)/dx)

    # Return the factors of an integer number
    # Taken from:
    # http://stackoverflow.com/questions/6800193/what-is-the-most-efficient-way-of-finding-all-the-factors-of-a-number-in-python
    # Modified to enforce integer and convert set to sorted list
    #---------------------------------------------------------------------------
    @classmethod
    def factors(cls, integer):
        n = int(integer)
        factors_set = set(reduce(list.__add__,
                ([i, n//i] for i in range(1, int(n**0.5) + 1) if n % i == 0)))
        factors_list = list(factors_set)
        factors_list.sort()
        return factors_list

    # dB - decibel value of the quantity
    #---------------------------------------------------------------------------
    @classmethod
    def dB(cls, x):
        return 20*np.log10(np.abs(x))

    ### Nice, but we can just use median from numpy
    ###-------------------------------------------------------------------------
    ##@classmethod
    ##def median(cls, lst):
    ##    even = (0 if len(lst) % 2 else 1) + 1
    ##    half = (len(lst) - 1) / 2
    ##    return sum(sorted(lst)[half:half + even]) / float(even)

    # Returns the zero crossing of the function between a and b
    # If f(a) and f(b) do not have different signs then the smallest of f(a) and
    # f(b) is returned
    #---------------------------------------------------------------------------
    @classmethod
    def bisect_or_min(cls, function, a, b):
        fa = function(a)
        fb = function(b)
        # Check that F(a) and F(b) have different signs
        if fa*fb < 0:
            return sci_opt.bisect(function, a, b)
        else:
            if abs(fa) < abs(fb):
                return a
            else:
                return b

    # Convert data in scientific notation (i.e. '1.23e-5') to a float
    #---------------------------------------------------------------------------
    @classmethod
    def sci_to_float(cls, data):

        try:
            if isinstance(data, str) \
            or isinstance(data, int) \
            or isinstance(data, float):
                return float(data)
            elif isinstance(data, list) \
            or isinstance(data, tuple):
                return map(float, data)
            else:
                cls.log.warning('Unexpected data type %s for data %s' % (type(data), data))
        except ValueError, e:
            cls.log.error('Data provided for conversion (%s) does not appear to be in scientific notation: %s' % (data, e))

    # Convert a float to scientific notation
    #---------------------------------------------------------------------------
    @classmethod
    def float_to_sci(cls, data):

        try:
            if isinstance(data, float) \
            or isinstance(data, str) \
            or isinstance(data, int):
                # Make sure it is a float first, then use print formatting
                digits = len(str(data)) - 2
                format_string = '{:.%se}' % digits
                return format_string.format(float(data))

            elif isinstance(data, list) \
            or isinstance(data, tuple):
                # Make sure it is a float first, then use print formatting
                return map(cls.float_to_sci, map(float, data))

            else:
                cls.log.warning('Unexpected data type %s for data %s' % (type(data), data))
        except ValueError, e:
            cls.log.error('Data provided for conversion (%s) does not appear to be a float: %s' % (data, e))

    # Convert data in engineering notation to a float
    #---------------------------------------------------------------------------
    @classmethod
    def eng_to_float(cls, data):
        inc_suffixes = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
        dec_suffixes = ['m', 'u', 'n', 'p', 'f', 'a', 'z', 'y']

        try:
            if isinstance(data, str):
                # Get the last character, check it is a valid prefix and then work
                # out the modifier using the index
                modifier_char = data[-1]
                if modifier_char in inc_suffixes:
                    modifier_value = math.pow(1000, (inc_suffixes.index(modifier_char) + 1))
                elif modifier_char in dec_suffixes:
                    modifier_value = math.pow(1000, -1*(dec_suffixes.index(modifier_char) + 1))
                # No modifier
                elif re.match('[0-9]+', modifier_char):
                    modifier_value = 1
                else:
                    cls.log.error('Data provided for conversion (%s) does not appear to be in engineering notation' % (data))
                    modifier_value = 1
                return float(float(data[0:-1]) * modifier_value)

            elif isinstance(data, list) \
            or isinstance(data, tuple):
                # Make sure it is a float first, then use print formatting
                return map(cls.eng_to_float, data)

            elif isinstance(data, float) \
            or isinstance(data, int):
                # We seem to have received a non-eng number so just return it
                return float(data)
            else:
                cls.log.warning('Unexpected data type %s for data %s' % (type(data), data))

        except ValueError, e:
            cls.log.error('Data provided for conversion (%s) does not appear to be in engineering notation: %s' % (data, e))

    # Convert a float to engineering notation
    #---------------------------------------------------------------------------
    @classmethod
    def float_to_eng(cls, data):
        # Taken from http://stackoverflow.com/questions/15733772/convert-float-number-to-string-with-engineering-notation-with-si-prefixe-in-py
        inc_suffixes = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
        dec_suffixes = ['m', 'u', 'n', 'p', 'f', 'a', 'z', 'y']

        try:
            if isinstance(data, float) \
            or isinstance(data, str) \
            or isinstance(data, int):
                # Handle the case when data is 0
                if float(data) != 0.0:
                    # Get the number of thousands in the data, as an int
                    degree = int(math.floor(math.log10(math.fabs(float(data))) / 3))

                    # Figure out which prefix to use and do the maths
                    # Note special case when degree is 0
                    if degree != 0:
                        # Get the sign of the degree
                        degree_sign = degree/math.fabs(degree)
                        if degree_sign == 1:
                            if degree - 1 < len(inc_suffixes):
                                prefix = inc_suffixes[degree - 1]
                            else:
                                prefix = inc_suffixes[-1]
                                degree = len(inc_suffixes)

                        elif degree_sign == -1:
                            if -degree - 1 < len(dec_suffixes):
                                prefix = dec_suffixes[-degree - 1]
                            else:
                                prefix = dec_suffixes[-1]
                                degree = -len(dec_suffixes)

                        # Scale the data appropriately
                        scaled = float(data * math.pow(1000, -degree))
                        # Format the result
                        eng_result = "{scaled}{prefix}".format(scaled=scaled, prefix=prefix)

                    else:
                        eng_result = "{data}".format(data=data)
                    return(eng_result)
                else:
                    return str(data)

            elif isinstance(data, list) \
            or isinstance(data, tuple):
                # Make sure it is a float first
                return map(cls.float_to_eng, map(float, data))
            else:
                cls.log.warning('Unexpected data type %s for data %s' % (type(data), data))

        except ValueError, e:
            cls.log.error('Data provided for conversion (%s) does not appear to be a float: %s' % (data, e))


    # Convert scientific notation to engineering notation
    #---------------------------------------------------------------------------
    @classmethod
    def sci_to_eng(cls, data):
        data = cls.sci_to_float(data)
        return cls.float_to_eng(data)

    # Convert engineering notation to scientific notation
    #---------------------------------------------------------------------------
    @classmethod
    def eng_to_sci(cls, data):
        data = cls.eng_to_float(data)
        return cls.float_to_sci(data)

    # zero_crossing - find the value of the x-axis zero crossing i.e. y=0
    #---------------------------------------------------------------------------
    @classmethod
    def zero_crossing(cls, x, y, always=False):
        ans = list()
        do_always = False
        # Check for the length of the arrays
        if np.shape(x)[0] <> np.shape(y)[0]:
            cls.log.error('Arrays must be the same shape %s vs. %s' % (np.shape(x), np.shape(y)))
            return None
        elif len(y) <= 1:
            if len(y) == 1 and y[0] == 0:
                ans.append(x[0])
                return ans
            else:
                cls.log.error('Arrays must have two or more elements - unless they are the zero crossing point')
                return None
        else:
            # Make sure we use float arithmetic
            y = np.multiply(y, 1.0)
            x = np.multiply(x, 1.0)
            # This is a clever way of finding the pair of points either side of the crossing
            # By multiplying two arrays which are staggered by one element, the only
            # negative multiple is where there is a positive * a negative.
            # The where function returns the indices that meet the condition
            index = list(np.where(y[1:]*y[:-1]<=0)[0])
            # If there are no crossings then if always is requested then find the
            # min values and use that or printa  message
            if len(index) <= 0:
                if always:
                    do_always = True
                    index = np.argmin(y)
                    # Back off by one if it is the last element
                    if index == len(y)-1:
                        index = [index-1]
                    else:
                        index = [index]
                else:
                    cls.log.warning('The arrays do not contain a zero crossing')
                    return None
            for i in index:
                if y[i] * y[i+1] < 0:
                    # This is a transposing of y=mx+c
                    # c = y-mx = y2-(x2*((y2-y1)/(x2-x1)))
                    # Transpose x and y to get the x intercept
                    # xintercept = x2-(y2*((x2-x1)/(y2-y1)))
                    ans.append(x[i+1]-(y[i+1]*((x[i+1]-x[i])/(y[i+1]-y[i]))))
                elif y[i] == 0:
                    ans.append(x[i])
                elif do_always:
                    ans.append(x[i+1]-(y[i+1]*((x[i+1]-x[i])/(y[i+1]-y[i]))))
            return ans

    # Find x value when y is at max or min
    #---------------------------------------------------------------------------
    @classmethod
    def xvalue_when_ymaxmin(cls, x, y, condition='min', x_axis=0):

        # Get the y_value
        if condition == 'min':
            y_value = np.amin(y)
        elif condition == 'max':
            y_value = np.amax(y)
        else:
            cls.log.error('Invalid value for condition: %s' % condition)

        print y
        print y_value
        # Get the index for the y_value
        index = ArrayUtils.array_where_to_list(np.where(y == y_value))
        print index

        # Get the x_value - from the x-axis
        if x_axis == 0:
            x_value = x[index[0]]
        elif x_axis == 1:
            x_value = x[index[0]][index[1]]
        elif x_axis == 2:
            x_value = x[index[0]][index[1]][index[2]]
        elif x_axis == 3:
            x_value = x[index[0]][index[1]][index[2]][index[3]]
        elif x_axis == 4:
            x_value = x[index[0]][index[1]][index[2]][index[3]][index[4]]

        return x_value


    # xvalue_when_ycondition - find the value of the x when the y-condition is
    # satisfied
    #---------------------------------------------------------------------------
    @classmethod
    def xvalue_when_ycondition(cls, x, y, condition, xwindow_min=None, xwindow_max=None,
                               transition='pos', maxtol=1e-8):
        nan=float('nan')
        ans = list()

        # Get the number of entries in the y dimension (number of columns)
        x = ArrayUtils.array_make2d(x)
        y = ArrayUtils.array_make2d(y)
        number_columns = max(np.shape(x)[1],np.shape(y)[1])

        # For each of the y dimension entries
        for col in range(number_columns):
            # Set xc to the set of y-dimension entries
            if np.shape(x)[1] == number_columns:
                xc = x[:,[col]]
            else:
                xc = x
            # Set yc to the set of y-dimension entries
            if np.shape(y)[1] == number_columns:
                yc = y[:,[col]]
            else:
                yc = y

            # Set xmin and xmax either to provided values or
            # to the min and max of the entries -/+1
            # xmin and xmax set the range (window) to look in for the function to be true
            if not xwindow_min:
                xwindow_min = min(xc)[0]-1
            if not xwindow_max:
                xwindow_max = max(xc)[0]+1

            # Set condition_met array true or false when all conditions are met
            condition_met = condition(yc)
            condition_met = condition(yc) & (xc>=xwindow_min) & (xc<=xwindow_max)

            # Set indices_condition_met to be the indices where the condition is met
            # Generate a list of indices for positive crossings i.e. False-> True
            # Generate a list of indices for negative crossings i.e. True->False
            # Generate a list of indices for all (any) crossings i.e. both pos and neg
            indices_condition_met = np.where(condition_met)[0]
            indices_condition_met_any = np.where(condition_met[:-1] != condition_met[1:])[0]
            indices_condition_met_pos = np.where((condition_met[:-1] != condition_met[1:]) & condition_met[1:])[0]
            indices_condition_met_neg = np.where((condition_met[:-1] != condition_met[1:]) & condition_met[:-1])[0]

            # Set index_to_use to be the index of the first entry that meets the condition
            if transition == 'pos':
                indices_to_use = indices_condition_met_pos
            elif transition == 'neg':
                indices_to_use = indices_condition_met_neg
            elif transition == 'any':
                indices_to_use = indices_condition_met_any
            else:
                cls.log.error('Unknown key: %s' % transition)
                sys.exit()

            if np.shape(indices_to_use)[0]>0:
                 index_to_use = indices_to_use[0]
            else:
                index_to_use = None
                cls.log.error('Index_to_use is set to None')
                sys.exit()

            # Now do the business with this index
            if index_to_use:
                # Figure out the transition type
                if transition == 'any':
                    if index_to_use in indices_condition_met_pos:
                        transition = 'pos'
                    elif index_to_use in indices_condition_met_neg:
                        transition = 'neg'
                    else:
                        cls.log.error('Index not in either pos or neg')
                        sys.exit()


                # Set the interval recorders (multipliers of the real values)
                a0, a1 = (0.0,1.0)
                # Set y0 and y1 to be the value before the met condition and after the met condition
                y0, y1 = (yc[index_to_use][0], yc[index_to_use+1][0])
                # Set x0 and x1 to be the value before the met condition and the met condition
                x0, x1 = (xc[index_to_use][0], xc[index_to_use+1][0])
                # Calculate difference in x and in y
                dx, dy = (x1-x0, y1-y0)
                # This is a kind of Newton-Raphson search using a binary search
                accuracy = 1
                while accuracy > maxtol:
                    # Set ax to average of a0 and a1
                    a_center = 0.5*(a0+a1)
                    # Set xx and yx to be some fraction above x0, y0
                    x_center, y_center = (x0+a_center*dx, y0+a_center*dy)
                    accuracy = a1 - a0
                    # Calculate the new a0, a1 values
                    # If it is a positive transition and the condition is met at y_center then
                    # look in the lower interval, otherwise look in upper interval
                    # Opposite for the negative transition
                    if transition == 'pos':
                        if (condition(y_center) & (x_center>=xwindow_min) & (x_center<=xwindow_max)):
                            a0, a1 = (a0, a_center)
                        else:
                            a0, a1 = (a_center, a1)
                    elif transition == 'neg':
                        if (condition(y_center) & (x_center>=xwindow_min) & (x_center<=xwindow_max)):
                            a0, a1 = (a_center, a1)
                        else:
                            a0, a1 = (a0, a_center)
                ans+=[x_center]
            else:
                ans+=[nan]
        return np.array(ans)

    # Measure either a falling or rising edge
    # --------------------------------------------------------------------------
    @classmethod
    def measure_edge_time(cls, xdata, ydata, low_threshold, high_threshold,
                          xwindow_min=None, xwindow_max=None, edge_type='rise', maxtol=1e-10):

        # # Transpose the arrays to get the rows into columns
        # xdata = xdata.T
        # ydata = ydata.T

        if edge_type == 'rise':
            low_x = cls.xvalue_when_ycondition(xdata, np.subtract(ydata, low_threshold), lambda y: y>=0.0,
                                               xwindow_min, xwindow_max, transition='pos', maxtol=maxtol)
            high_x = cls.xvalue_when_ycondition(xdata, np.subtract(ydata, high_threshold), lambda y: y>=0.0,
                                               xwindow_min, xwindow_max, transition='pos', maxtol=maxtol)
            return np.subtract(high_x, low_x)

        elif edge_type == 'fall':
            high_x = cls.xvalue_when_ycondition(xdata, np.subtract(ydata, high_threshold), lambda y: y>=0.0,
                                               xwindow_min, xwindow_max, transition='neg', maxtol=maxtol)
            low_x = cls.xvalue_when_ycondition(xdata, np.subtract(ydata, low_threshold), lambda y: y>=0.0,
                                               xwindow_min, xwindow_max, transition='neg', maxtol=maxtol)
            return np.subtract(low_x, high_x)



    # Get the y-value at specified xvalue from a curve the we interpolate
    #---------------------------------------------------------------------------
    @classmethod
    def yvalue_at_specifiedx(cls, xdata, ydata, x, if_family='min'):

        # Transpose the arrays to get the rows into columns
        xdata = xdata.T
        ydata = ydata.T

        # Get the shape of the data and ydata
        # For a family of curves expect the rows to be the same and the families
        # in columns
        x_shape = np.shape(xdata)
        y_shape = np.shape(ydata)

        # Check for the length of the arrays
        if x_shape[0] <> y_shape[0]:
            cls.log.error('Arrays must be the same shape %s vs. %s' % (x_shape, y_shape))
            return None

        # Step over all of the columns - record required y-value
        y_values = list()
        for index in range(y_shape[0]):

            # First of all interpolate the data to get a function
            function = sci_int.interp1d(xdata[index], ydata[index])

            # Add the y-value to the list
            y_values.append(function(x))

        # Return the requested value
        if len(y_values) == 1:
            return y_values[0]
        elif if_family == 'min':
            return min(y_values)
        elif if_family == 'max':
            return max(y_values)
        elif if_family == 'family':
            return y_values

    # Calculate straight line gradient and intercept
    #---------------------------------------------------------------------------
    @classmethod
    def calculate_sl_grad_inter(cls, xvalues, yvalues):

        if len(xvalues) <> len(yvalues):
            cls.log.error('X and Y values must have same number of points')
            return (None, None)

        if not cls.is_monotonic_increasing(xvalues):
            cls.log.error('X values must be monotonically increasing  - this is a straight line graph!')
            return (None, None)

        if not cls.is_monotonic(yvalues):
            cls.log.error('Y values must be monotonic - this is a straight line graph!')
            return (None, None)

        # Derive a function to fit to the data
        function = sci_int.interp1d(xvalues, yvalues, kind='slinear', assume_sorted=True)
        max_x = max(xvalues)
        min_x = min(xvalues)
        gradient = (function(max_x) - function(min_x))/(max_x-min_x)
        intercept = function(max_x)-(gradient*max_x)
        return (gradient, intercept)

    # Check if the values are monotonic increasing
    #---------------------------------------------------------------------------
    @classmethod
    def is_monotonic_increasing(cls, values):
        pairs = zip(values, values[1:])
        return all(itertools.starmap(operator.le, pairs))

    # Check if the values are monotonic decreasing
    #---------------------------------------------------------------------------
    @classmethod
    def is_monotonic_decreasing(cls, values):
        pairs = zip(values, values[1:])
        return all(itertools.starmap(operator.ge, pairs))

    # Check if the values are monotonic increasing or decreasing
    #---------------------------------------------------------------------------
    @classmethod
    def is_monotonic(cls, values):
        return cls.is_monotonic_increasing(values) or cls.is_monotonic_decreasing(values)


#-----------------------------------------------------------------------------------------------
def decodeNets(netStr):
    if netStr.__class__ is list or netStr.__class__ is tuple:
        nets=[]
        for net in netStr:
            nets.extend(decodeNets(net))
        return nets
    netStr=str(netStr)
    if '[' in netStr and ':' in netStr:
        root, after = netStr.split('[')
        indx1, after = after.split(':')
        indx2 = int(after.split(']')[0])
        indx1 = int(indx1)
        if indx2>indx1:
            return ['%s[%d]'%(root, i) for i in range(indx1, indx2+1)]
        else:
            return ['%s[%d]'%(root, i) for i in range(indx1, indx2-1, -1)]
    else:
        return [netStr]


#-------------------------------------------------------------------------------
def xycond(x, y, func, xmin=None, xmax=None):
    nan=float('nan')
    numc=max(np.shape(x)[1],np.shape(y)[1])
    ans=[]
    for c in range(numc):
        xc=x[:,[c]] if np.shape(x)[1]==numc else x
        yc=y[:,[c]] if np.shape(y)[1]==numc else y
        xmin2=xmin if xmin else min(xc)[0]-1
        xmax2=xmax if xmax else max(xc)[0]+1
        fyc=func(yc) & (xc>=xmin2) & (xc<=xmax2)
        r0=where(fyc)[0]
        r0=r0[0] if np.shape(r0)[0]>0 else None
        if r0:
            if r0>0:
                a0,a1=(0.0,1.0)
                y0,y1=(yc[r0-1][0],yc[r0][0])
                x0,x1=(xc[r0-1][0],xc[r0][0])
                dx,dy=(x1-x0,y1-y0)
                for i in range(20):
                    ax=0.5*(a0+a1)
                    xx,yx=(x0+ax*dx,y0+ax*dy)
                    a0,a1=(a0,ax) if (func(yx) & (xx>=xmin2) & (xx<=xmax2)) else (ax,a1)
                ans+=[xx]
            else:
                ans+=[xc[0][0]]
        else:
            ans+=[nan]
    return np.array(ans)


#=============================== END OF FILE ===================================
#===============================================================================
