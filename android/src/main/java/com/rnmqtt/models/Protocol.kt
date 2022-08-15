package com.rnmqtt.models

enum class Protocol {
  WS {
    override fun urlPrefix(): String = "ws://"
     },
  WSS {
    override fun urlPrefix(): String = "wss://"
      },
  SSL {
    override fun urlPrefix(): String = "ssl://"
      },
  TCP {
    override fun urlPrefix(): String = "tcp://"
  };

  abstract fun urlPrefix(): String
}
