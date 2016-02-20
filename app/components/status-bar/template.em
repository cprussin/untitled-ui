.volume class=audio.mute:mute = audio.volume
liquid-bind .networks network.networks as |networks|: each networks as |net|
  .network class=net.type
    if (eq net.type 'wireless'): .ssid = net.ssid
    .ip = net.ip
.battery 26.66
