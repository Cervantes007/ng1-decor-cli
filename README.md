# ng1-decor-cli
Complement to ng1-decor package, enable cli to scaffolding components, routes, services, models and pipes, .

# How to install
$ npm install -g ng1-decor-cli

$ yarn global add ng1-decor-cli

# Access to cli help
$ ra invoke --help

# Add Components
$ ra invoke component hero-list [list]

Options:
- [--style 'set style file']
- [--routing 'Add to route']
- [--test 'Add test file']
- [--rx 'convert to reactive component']

# Add Services
$ ra invoke component user-profile

# Add Models
$ ra invoke model users

# Add Pipes
$ ra invoke pipe init-caps

# Add Enumerables
$ ra invoke enum sequences-types

# Add Interfaces
$ ra invoke interface user-profile

# Routing
$ ra routing list
