<template>
  <div :class="[$style['video-tag-wrap'], { [$style['padding']]: padding }]">
    <div style="min-width:48px;" v-if="isDialog">标签：</div>
    <div
      v-for="(tTag, index) in tags"
      :key="`tag-${index}`"
      :class="[
        $style['tag'],
        { [$style['custom']]: $route.query.source === 'sp' },
        { [$style['custom-dialog']]: isDialog }
      ]"
      :style="index == 0 ? { margin: '0 0 0 -5px' } : {}"
    >
      {{ tTag }}
    </div>
  </div>
</template>

<script>
import split from "lodash/split";

export default {
  components: {},
  props: {
    tag: {
      type: String,
      required: true
    },
    padding: {
      type: Boolean
    },
    isDialog: {
      type: Boolean
    }
  },
  computed: {
    tags() {
      return split(this.tag, ",");
    }
  }
};
</script>

<style lang="scss" module>
@import "~@/css/variable.scss";

.video-tag-wrap {
  align-items: center;
  color: #adafb8;
  display: flex;
  // overflow-x: auto;
  width: 100%;
  height: 40px;

  &.padding {
    padding: 0 14px;
  }

  > .tag {
    background: #eeeeee;
    border-radius: 9px;
    text-align: center;
    padding: 0 10px;
    font-size: 12px;
    line-height: 18px;
    font-weight: 400;
    margin: 0 5px;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.custom {
      background: #474747;
    }

    &.custom-dialog {
      background: #eee;
      color: #333;
    }
  }
}

@media screen and (min-width: $pad) {
  .video-tag-wrap {
    > .tag {
      height: 20px;
      border-radius: 12px;
      line-height: 20px;
    }
  }
}
</style>
