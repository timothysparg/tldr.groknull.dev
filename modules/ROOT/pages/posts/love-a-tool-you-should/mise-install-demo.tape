Hide
Type "./start-mise-container.sh"
Enter
# Match a generic root prompt ending in #
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

Type 'clear'
Enter
Show

Type "git clone --depth 1 --branch main https://github.com/timothysparg/gold"
Enter
Wait+Line /\$ ?$/

Hide
Type "sed -i -e '/^.plugins./d' -e '/^fnox-env = .https/d' -e '/^_.fnox-env =/d' gold/mise.toml"
Enter
Wait+Line /\$ ?$/

Type "head -20 gold/mise.toml"
Enter
Wait+Line /\$ ?$/

Type "clear; gum style --border double --margin 1 --padding '1 2' --border-foreground 212 'Mise Requires explicitly trusting a new project'; sleep 5; clear"
Enter
Sleep 500ms
Show
Sleep 5s

Type "cd gold"
Enter
Wait+Line /\$ ?$/
Sleep 3s

Type "mise trust"
Enter
Wait+Line /\$ ?$/
Sleep 2s

Type "mise install"
Enter
Wait+Line /\$ ?$/
Sleep 2s

Type "mise ls"
Enter
Wait+Line /\$ ?$/
Sleep 4s

Hide
Type "exit"
Enter
Sleep 1s
