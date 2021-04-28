import yaml
import sys

def to_camel_case(snake_str):
    components = snake_str.split('_')
    # We capitalize the first letter of each component except the first one
    # with the 'title' method and join them together.
    return components[0] + ''.join(x.title() for x in components[1:])

def write_group_header(outfile, method_group):
    outfile.write("// " + "="*77 + "\n")
    if method_group == "data_methods":
        outfile.write ("// Data Methods\n")
    elif method_group == "action_methods":
        outfile.write ("// Action Methods\n")
    outfile.write("// " + "=" * 77 + "\n\n")

def write_header(outfile, in1, method):
    outfile.write("{}/**\n".format(in1))
    outfile.write("{} * {}\n".format(in1, method["description"]))
    for param in method["parameters"]:
        outfile.write("{} * @param {} - {}\n".format(in1, param["name"], param["description"]))
    outfile.write("{} */\n".format(in1))

def write_signature(outfile, in1, method, use_name):
    outfile.write("{}export function {}(".format(in1, to_camel_case(use_name)))
    indent = len(in1) + len("export function (") + len(to_camel_case(use_name))
    counter = 0
    if (len(method["parameters"]) > 0):
        for param in method["parameters"]:
            if counter > 0:
                outfile.write(", ")
            if "default" in param:
                outfile.write("{}: {} = {}".format(param["name"], param["type"], param["default"]))
            else:
                outfile.write("{}: {}".format(param["name"], param["type"]))
            counter += 1
        outfile.write(",\n")
        outfile.write("{}browser: Browser<'async'> | MultiRemoteBrowser<'async'>,\n".format(' '*indent))
    else:
        outfile.write("{}browser: Browser<'async'> | MultiRemoteBrowser<'async'>,\n".format(' ' * 0))
    outfile.write("{}api: VitaqAiApi) {}\n".format(' '*indent, "{"))

def write_async_signature(outfile, in1, method, use_name):
    outfile.write("{}export async function {}(".format(in1, to_camel_case(use_name)))
    indent = len(in1) + len("export async function (") + len(to_camel_case(use_name))
    counter = 0
    if (len(method["parameters"]) > 0):
        for param in method["parameters"]:
            if counter > 0:
                outfile.write(", ")
            if "default" in param:
                outfile.write("{}: {} = {}".format(param["name"], param["type"], param["default"]))
            else:
                outfile.write("{}: {}".format(param["name"], param["type"]))
            counter += 1
        outfile.write(",\n")
        outfile.write("{}browser: Browser<'async'> | MultiRemoteBrowser<'async'>,\n".format(' '*indent))
    else:
        outfile.write("{}browser: Browser<'async'> | MultiRemoteBrowser<'async'>,\n".format(' ' * 0))
    outfile.write("{}api: VitaqAiApi) {}\n".format(' '*indent, "{"))

def write_argument_check(outfile, in2, method, use_name):
    outfile.write("{}let argumentsDescription = {}".format(in2, '{'))
    counter = 0
    if (len(method["parameters"]) > 0):
        for param in method["parameters"]:
            if counter > 0:
                outfile.write(", ")
            outfile.write('"{}": "{}"'.format(param["name"], param["type"]))
            counter += 1
    outfile.write("{}\n".format("}"))
    outfile.write("{}validateArguments('{}', argumentsDescription, args);\n".format(in2, to_camel_case(use_name)))

def write_sync_body(outfile, in1, in2, in3, method, use_name):
    outfile.write("{}let args: any [] = Array.from(arguments);\n".format(in2))
    outfile.write("{}args.splice(-2, 2);\n".format(in2))
    # Write out a log.debug with each of the parameters
    outfile.write("{}log.debug('VitaqService: {}: ".format(in2, to_camel_case(use_name)))
    counter = 0
    for param in method["parameters"]:
        if counter > 0:
            outfile.write(", ")
        outfile.write("{}".format(param["name"]))
        counter += 1
    outfile.write("', ")
    counter = 0
    for param in method["parameters"]:
        if counter > 0:
            outfile.write(", ")
        outfile.write("{}".format(param["name"]))
        counter += 1
    outfile.write(");\n")
    write_argument_check(outfile, in2, method, use_name)
    outfile.write("{}// @ts-ignore\n".format(in2))
    outfile.write("{}return this._browser.call(() =>\n".format(in2))
    outfile.write("{}api.runCommandCaller('{}', args)\n".format(in3, name))
    outfile.write("{})\n".format(in2))
    outfile.write("{}{}\n\n".format(in1, "}"))

def write_async_body(outfile, in1, in2, in3, method, use_name):
    outfile.write("{}let args: any [] = Array.from(arguments);\n".format(in2))
    outfile.write("{}args.splice(-2, 2);\n".format(in2))
    # Write out a log.debug with each of the parameters
    outfile.write("{}log.debug('VitaqService: {}: ".format(in2, to_camel_case(use_name)))
    counter = 0
    for param in method["parameters"]:
        if counter > 0:
            outfile.write(", ")
        outfile.write("{}".format(param["name"]))
        counter += 1
    outfile.write("', ")
    counter = 0
    for param in method["parameters"]:
        if counter > 0:
            outfile.write(", ")
        outfile.write("{}".format(param["name"]))
        counter += 1
    outfile.write(");\n")
    write_argument_check(outfile, in2, method, use_name)
    outfile.write("{}// @ts-ignore\n".format(in2))
    outfile.write("{}return await api.runCommandCaller('{}', args)\n".format(in2, name))
    outfile.write("{}{}\n\n".format(in1, "}"))

def write_service_entry(outfile, in1, in2, method, use_name):
    outfile.write("{}{}(".format(in1, to_camel_case(use_name)))
    counter = 0
    if (len(method["parameters"]) > 0):
        for param in method["parameters"]:
            if counter > 0:
                outfile.write(", ")
            if "default" in param:
                outfile.write("{}: {} = {}".format(param["name"], param["type"], param["default"]))
            else:
                outfile.write("{}: {}".format(param["name"], param["type"]))
            counter += 1
    outfile.write(") {}\n".format('{'))
    outfile.write("{}// @ts-ignore\n".format(in2, '{'))
    outfile.write("{}return this.vitaqFunctions.{}(".format(in2, to_camel_case(use_name)))
    counter = 0
    if (len(method["parameters"]) > 0):
        for param in method["parameters"]:
            if counter > 0:
                outfile.write(", ")
            outfile.write("{}: {}".format(param["name"], param["type"]))
            counter += 1
    if counter > 0:
        outfile.write(", this._browser, this._api)\n")
    else:
        outfile.write("this._browser, this._api)\n")
    outfile.write("{}{}\n\n".format(in1, "}"))

# ------------------------------------------------------------------------------
# Main
# ------------------------------------------------------------------------------

# Open the YAML file with the service methods details
top_yaml = yaml.load(open(sys.argv[1]), Loader=yaml.FullLoader)

# Variables
in1 = ""
in2 = "    "
in3 = "        "

# Open the output file in write mode
with open("outfile_sync.txt", 'w') as outfile:

    # Iterate over different method groupings
    for method_group in top_yaml:
        write_group_header(outfile, method_group)
        methods = top_yaml[method_group]

        # Iterate through the methods after sorting
        sorted_methods = {key: methods[key] for key in sorted(methods)}
        for name in sorted_methods:
            method = sorted_methods[name]

            # Check if we have an altname and if we do, then use that
            if "altname" in method:
                use_name = method['altname']
            else:
                use_name = name

            if method["include"]:

                # Write the header
                write_header(outfile, in1, method)

                # Write the write_signature
                write_signature(outfile, in1, method, use_name)

                # Write the sync body
                write_sync_body(outfile, in1, in2, in3, method, use_name)

# Open the output file in write mode
with open("outfile_async.txt", 'w') as outfile:

    # Iterate over different method groupings
    for method_group in top_yaml:
        write_group_header(outfile, method_group)
        methods = top_yaml[method_group]

        # Iterate through the methods after sorting
        sorted_methods = {key: methods[key] for key in sorted(methods)}
        for name in sorted_methods:
            method = sorted_methods[name]

            # Check if we have an altname and if we do, then use that
            if "altname" in method:
                use_name = method['altname']
            else:
                use_name = name

            if method["include"]:

                # Write the header
                write_header(outfile, in1, method)

                # Write the write_signature
                write_signature(outfile, in1, method, use_name)

                # Write the sync body
                write_async_body(outfile, in1, in2, in3, method, use_name)

# Open the output file in write mode
with open("service_entry.txt", 'w') as outfile:

    # Iterate over different method groupings
    for method_group in top_yaml:
        write_group_header(outfile, method_group)
        methods = top_yaml[method_group]

        # Iterate through the methods after sorting
        sorted_methods = {key: methods[key] for key in sorted(methods)}
        for name in sorted_methods:
            method = sorted_methods[name]

            # Check if we have an altname and if we do, then use that
            if "altname" in method:
                use_name = method['altname']
            else:
                use_name = name

            if method["include"]:

                # Write the entry
                write_service_entry(outfile, in2, in3, method, use_name)
