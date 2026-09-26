# Off camera: start the container and set up gold, exactly as in the mise install demo
Hide
Type "./start-mise-container.sh"
Enter
Wait+Line /# ?$/

Type 'eval "$(mise activate zsh)"'
Enter
Wait+Line /# ?$/

Type 'PROMPT="$ "'
Enter
Wait+Line /\$ ?$/

Type 'bindkey -e'
Enter
Wait+Line /\$ ?$/

Type "git clone --depth 1 --branch main https://github.com/timothysparg/gold && cd gold"
Enter
Wait+Line /\$ ?$/

Type "sed -i -e '/^.plugins./d' -e '/^fnox-env = .https/d' -e '/^_.fnox-env =/d' mise.toml"
Enter
Wait+Line /\$ ?$/

# mise install also runs the postinstall hook, which installs hk's git hooks
Type "mise trust && mise install"
Enter
Wait+Line /\$ ?$/

Type "git config --global user.name Demo && git config --global user.email demo@example.com"
Enter
Wait+Line /\$ ?$/

# Squash the Java file onto one line so google-java-format has something to fix
Type "cd src/main/java/com/example/demo && tr -s '\n ' ' ' < GoldApplication.java > /tmp/G.java && mv /tmp/G.java GoldApplication.java"
Enter
Wait+Line /\$ ?$/

Type "clear"
Enter
Show

# On camera: a messy file, a commit, and hk tidying it up
Type "bat GoldApplication.java"
Enter
Wait+Line /\$ ?$/
Sleep 3s

Type "git commit -am 'feat: tidy up GoldApplication'"
Enter
Wait+Line /\$ ?$/
Sleep 4s

Type "bat GoldApplication.java"
Enter
Wait+Line /\$ ?$/
Sleep 4s

Hide
Type "exit"
Enter
Sleep 1s
