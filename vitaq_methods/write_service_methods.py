import yaml
import sys

def to_camel_case(snake_str):
    components = snake_str.split('_')
    # We capitalize the first letter of each component except the first one
    # with the 'title' method and join them together.
    return components[0] + ''.join(x.title() for x in components[1:])


# ------------------------------------------------------------------------------
# Main
# ------------------------------------------------------------------------------

# Open the YAML file with the service methods details
top_yaml = yaml.load(open(sys.argv[1]), Loader=yaml.FullLoader)
methods = top_yaml["methods"]

# Variables
in1 = "    "
in2 = "        "
in3 = "            "

# Open the output file in write mode
with open("outfile.txt", 'w') as outfile:

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
            outfile.write("{}/**\n".format(in1))
            outfile.write("{} * {}\n".format(in1, method["description"]))
            for param in method["parameters"]:
                outfile.write("{} * @param {} - {}\n".format(in1, param["name"], param["description"]))
            outfile.write("{} */\n".format(in1))
            outfile.write("{}{}(".format(in1, to_camel_case(use_name)))
            counter = 0
            for param in method["parameters"]:
                if counter > 0:
                    outfile.write(", ")
                if "default" in param:
                    outfile.write("{}: {} = {}".format(param["name"], param["type"], param["default"]))
                else:
                    outfile.write("{}: {}".format(param["name"], param["type"]))
                counter += 1
            outfile.write(") {\n")
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
            outfile.write("{}// @ts-ignore\n".format(in2))
            outfile.write("{}return this._browser.call(() =>\n".format(in2))
            outfile.write("{}this._api.runCommandCaller('{}', arguments)\n".format(in3, name))
            outfile.write("{})\n".format(in2))
            outfile.write("{}{}\n\n".format(in1, "}"))
