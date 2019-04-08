https://blog.csdn.net/lakeheart879/article/details/77336393

這裏介紹如何使用 vcgencmd 指令查看 Raspberry Pi 的 CPU 溫度、運行速度與電壓等資訊，即時監控硬體的狀態。

在 Raspberry Pi 中我們可以利用 vcgencmd 指令來查看各種的硬體資訊與狀態，以下是常用的指令範例。

時脈頻率（clock frequency）
如果要查詢硬體目前的時脈頻率，可以使用 measure_clock 參數：

vcgencmd measure_clock <clock>
其中的 <clock> 是指定要查詢的硬體，可用的選項有 arm、 core、 h264、 isp、 v3d、 uart、pwm、 emmc、 pixel、 vec、 hdmi、 dpi。

如果要查詢 CPU 的時脈頻率（也就是速度），可以執行

vcgencmd measure_clock arm
輸出為
frequency(45)=700000000

如果想查詢所有的硬體時脈頻率，可以使用簡單的 shell 指令稿：

for src in arm core h264 isp v3d uart pwm emmc pixel vec hdmi dpi ; do \
  echo -e "$src:\t$(vcgencmd measure_clock $src)" ; \
done
輸出為
arm:   frequency(45)=700000000
core:  frequency(1)=250000000
h264:  frequency(28)=250000000
isp:   frequency(42)=250000000
v3d:   frequency(43)=250000000
uart:  frequency(22)=3000000
pwm:   frequency(25)=0
emmc:  frequency(47)=250000000
pixel: frequency(29)=108000000
vec:   frequency(10)=0
hdmi:  frequency(9)=163682000
dpi:   frequency(4)=0

電壓（voltage）
如果要查詢硬體目前的工作電壓，可以使用 measure_volts 參數：

vcgencmd measure_volts <id>
其中 <id> 是指定要查詢的硬體，可用的選項有 core、 sdram_c、 sdram_i、 sdram_p。如果沒有指定 <id>，則預設為 core：

vcgencmd measure_volts
輸出為
volt=1.200V

查詢所有工作電壓的 shell 指令稿：

for id in core sdram_c sdram_i sdram_p ; do \
  echo -e "$id:\t$(vcgencmd measure_volts $id)" ; \
done
輸出為
core: volt=1.200V
sdram_c: volt=1.200V
sdram_i: volt=1.200V
sdram_p: volt=1.225V

溫度（temperature）
如果要查詢 BCM2835 SoC 目前的溫度，可以使用 measure_temp 參數：

vcgencmd measure_temp
輸出為
temp=43.3’C

Codec
若要查詢特定的 codec 有沒有啟用，可以使用 codec_enabled 參數：

vcgencmd codec_enabled <codec>
其中 <codec> 是指定要查詢的 codec，可用的選項有：H264、 MPG2、 WVC1、 MPG4、 MJPG、 WMV9。

查詢所有 codec 的指令稿：

for codec in H264 MPG2 WVC1 MPG4 MJPG WMV9 ; do \
  echo -e "$codec:\t$(vcgencmd codec_enabled $codec)" ; \
done
輸出為：
H264: H264=enabled
MPG2: MPG2=disabled
WVC1: WVC1=disabled
MPG4: MPG4=enabled
MJPG: MJPG=enabled
WMV9: WMV9=disabled

設定值（configurations）
get_config 參數可以列出目前系統中所有被設定的參數值：

vcgencmd get_config [config|int|str]
最後一個參數可用來指定要查詢的設定值名稱或是類型，例如查詢 temp_limit 的數值可以執行：

vcgencmd get_config temp_limit
輸出為
temp_limit=85
查詢所有數值資料的設定值可用

vcgencmd get_config int
輸出為
hdmi_force_hotplug=1
disable_overscan=1
overscan_left=24
overscan_right=24
overscan_top=16
overscan_bottom=16
program_serial_random=1
config_hdmi_boost=4
emmc_pll_core=1
hdmi_force_cec_address=65535
framebuffer_ignore_alpha=1
framebuffer_swap=1
disable_splash=1
temp_limit=85
force_pwm_open=1
pause_burst_frames=1
second_boot=1
avoid_fix_ts=1

記憶體配置
Raspberry Pi 的 CPU 與 GPU 是共用同同一個記憶體的，get_mem 參數可以查詢目前記憶體的配置狀態。查詢配置給 CPU 的記憶體大小：

vcgencmd get_mem arm
輸出為
arm=448M
查詢配置給 GPU 的記憶體大小：

vcgencmd get_mem gpu
輸出為
gpu=64M

韌體版本（firmware version）
查詢韌體版本可以使用

vcgencmd version
輸出為
Dec 19 2014 18:44:06
Copyright (c) 2012 Broadcom
version 5abd572e2ed1811283443387af09377b95501c50 (clean) (release)

OTP 記憶體
若要查詢 SoC 裡面 OTP（one time programmable）記憶體的內容，可以使用 otp_dump：

vcgencmd otp_dump
輸出為
08:00000000
09:00000000
10:00000000
11:00000000
12:00000000
13:00000000
14:00000000
15:00000000
16:00280000
17:1020000a
18:1020000a
19:ffffffff
20:ffffffff
21:ffffffff
22:ffffffff
23:ffffffff
24:ffffffff
25:ffffffff
26:ffffffff
27:0000c2c2
28:4b45c38d
29:b4ba3c72
30:00000010
31:00000000
32:00000000
33:00000000
34:00000000
35:00000000
36:00000000
37:00000000
38:00000000
39:00000000
40:00000000
41:00000000
42:00000000
43:00000000
44:00000000
45:00000000
46:00000000
47:00000000
48:00000000
49:00000000
50:00000000
51:00000000
52:00000000
53:00000000
54:00000000
55:00000000
56:00000000
57:00000000
58:00000000
59:00000000
60:00000000
61:00000000
62:00000000
63:00000000
64:00000000
其中 28 與 30 代表硬體序號（serial）與修訂版（revision）的版本號碼，/proc/cpuinfo 中所顯示的序號與修訂版本號碼就是從這裡取得的，而 Model B/B+ 的網路卡 MAC 卡號也是根據硬體序號來產生的。

查看 vcgencmd 所有可用的參數
如果要查看 vcgencmd 指令所有可用的參數，可以執行

vcgencmd commands
輸出會類似這樣：
commands=”vcos, ap_output_control, ap_output_post_processing, vchi_test_init, vchi_test_exit, pm_set_policy, pm_get_status, pm_show_stats, pm_start_logging, pm_stop_logging, version, commands, set_vll_dir, led_control, set_backlight, set_logging, get_lcd_info, set_bus_arbiter_mode, cache_flush, otp_dump, test_result, codec_enabled, get_camera, get_mem, measure_clock, measure_volts, scaling_kernel, measure_temp, get_config, hdmi_ntsc_freqs, hdmi_adjust_clock, hdmi_status_show, hvs_update_fields, pwm_speedup, force_audio, hdmi_stream_channels, hdmi_channel_map, display_power, read_ring_osc, memtest, get_rsts, render_bar, disk_notify, inuse_notify, sus_suspend, sus_status, sus_is_enabled, sus_stop_test_thread, egl_platform_switch, mem_validate, mem_oom, mem_reloc_stats, file, vctest_memmap, vctest_start, vctest_stop, vctest_set, vctest_get”
這些就是所有可以使用的參數，這些參數會因為韌體版本不同而有差異。

