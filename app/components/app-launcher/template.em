.overlay
liquid-if .background showBackground use='fade'
.status
  .volume 46
  .network Centar 192.168.1.121
  .battery 26.66
liquid-bind .date date use='toLeft'
clock-e .clock date=false
= input class=open value=value enter='handleEnter'
.spacer
