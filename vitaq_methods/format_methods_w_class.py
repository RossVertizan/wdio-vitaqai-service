
import sys
from yaml_writer import YAML as yaml

#get_grade() : ItemBase , ItemEntry , TestEntry , BinBase , BinEntry , CoverageObject , Covergroup , CovergroupEntry , Item< T >

# Take in the methods which show the classes they belong to (cut and paste) from
# documentation and convert it into a standard Python data structure and write it
# to yaml.
methods = dict()
with open(sys.argv[1]) as infile:
    for line in infile:
        (method_name, classes_string) = line.split(':')
        method_name = method_name.strip()
        classes_string = classes_string.strip()
        classes_list = classes_string.split(' , ')
        methods[method_name] = classes_list

yaml.yaml_write(methods, 'vitaq_methods_w_class.yml')

# Now take that data structure and swith it around, so that we have the methods
# that belong to a given class i.e. class is now the key and we have a list of
# methods

classes = dict()
for method in methods:
    for class_name in methods[method]:
        if class_name not in classes:
            classes[class_name] = list()
        classes[class_name].append(method)
yaml.yaml_write(classes, 'vitaq_class_w_methods.yml')

# Now get a list of all of the classes and then the methods for the cpp2py assess
# section
list_all = list()
for class_name in classes:
    list_all.append(class_name)
for method_name in methods:
    list_all.append(method_name)
    
# Strip any braces or templates
for index, item in enumerate(list_all):
    item = item.replace('< T >', '')
    item = item.replace('()', '')
    list_all[index] = item
# Filter out duplicates
list_final = list()
for item in list_all:
    if item not in list_final:
        list_final.append(item)
yaml.yaml_write(list_final, 'vitaq_class_and_methods.yml')
