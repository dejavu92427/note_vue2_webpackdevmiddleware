<template>
    <div :class="[$style['news-wrap'], 'clearfix']">
        <div :class="$style['news-title']">{{ title }}</div>
        <ele-news :class="$style['news']" data-source="agent" />
    </div>
</template>

<script>
import eleNews from '@/router/web/components/common/news';

export default {
    components: {
        eleNews
    },
    props: {
        theme: {
            type: Object,
            default: null
        },
        title: {
            type: String,
            default: 'NEWS'
        }
    },
    computed: {
        $style() {
            if (this.theme) {
                return this.theme;
            }
            return this.$styleMarqueeNews;
        }
    }
};
</script>

<style src="../../../css/common/marqueeNews.module.scss" lang="scss" module="$styleMarqueeNews" />
