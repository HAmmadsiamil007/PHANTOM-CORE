<?php
/**
 * Partial render callbacks for Selective Refresh.
 *
 * Each function returns an HTML fragment for the given setting key.
 *
 * @package Phantom_Core
 */

defined( 'ABSPATH' ) || exit;

function phantom_render_header_partial(): void {
	echo '<div class="phantom-partial-header">' . esc_html__( 'Header', 'phantom-core' ) . '</div>';
}

function phantom_render_footer_partial(): void {
	echo '<div class="phantom-partial-footer">' . esc_html__( 'Footer', 'phantom-core' ) . '</div>';
}

function phantom_render_blog_partial(): void {
	echo '<div class="phantom-partial-blog">' . esc_html__( 'Blog posts will appear here.', 'phantom-core' ) . '</div>';
}

function phantom_render_search_partial(): void {
	echo '<div class="phantom-partial-search">' . esc_html__( 'Search results will appear here.', 'phantom-core' ) . '</div>';
}

function phantom_render_nav_partial(): void {
	wp_nav_menu( array(
		'theme_location' => get_option( 'phantom_menu_location', 'phantom_primary' ),
		'container'      => 'nav',
		'container_class' => 'site-navigation main-navigation',
		'menu_class'     => 'primary-menu',
		'fallback_cb'    => false,
	) );
}
