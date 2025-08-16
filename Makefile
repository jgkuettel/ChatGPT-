GBDK_HOME ?= /opt/gbdk
LCC := $(GBDK_HOME)/bin/lcc

TARGET := pong
BUILD := build
SRC := src

CFLAGS := -Wl-yt0x1B -Wl-ya4 -Wm-yoA -Wm-ys0

$(BUILD)/$(TARGET).gb: $(SRC)/pong.c | $(BUILD)
	$(LCC) $(CFLAGS) -o $@ $<

$(BUILD):
	mkdir -p $(BUILD)

clean:
	rm -rf $(BUILD)
