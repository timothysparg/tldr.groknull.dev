FROM ubuntu:26.04

ENV DEBIAN_FRONTEND=noninteractive
ENV MISE_INSTALL_PATH=/usr/local/bin/mise
ENV PATH=/root/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    bat \
    docker.io \
    gnupg \
    zsh \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://repo.charm.sh/apt/gpg.key | gpg --dearmor -o /etc/apt/keyrings/charm.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/charm.gpg] https://repo.charm.sh/apt/ * *" | tee /etc/apt/sources.list.d/charm.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends gum \
  && rm -rf /var/lib/apt/lists/*

RUN if command -v batcat >/dev/null 2>&1 && ! command -v bat >/dev/null 2>&1; then \
      ln -sf "$(command -v batcat)" /usr/local/bin/bat; \
    fi

RUN mkdir -p /root/.config/bat \
  && printf '%s\n' '--paging=never' > /root/.config/bat/config

# Use the terminal's own palette so bat's highlighting matches the VHS theme
ENV BAT_THEME=ansi

RUN curl -fsSL https://mise.run | sh \
  && /usr/local/bin/mise --version
