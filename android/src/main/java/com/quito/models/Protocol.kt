package com.quito.models

enum class Protocol {
  WS {
    override fun urlPrefix(): String = "ws://"
     },
  WSS {
    override fun urlPrefix(): String = "wss://"
      },
  TCP_TLS {
    override fun urlPrefix(): String = "ssl://"
      },
  TCP {
    override fun urlPrefix(): String = "tcp://"
  };

  abstract fun urlPrefix(): String
}
