<?php
/**
 * Layout CSS Module
 *
 * @package Phantom_Core
 */

defined( 'ABSPATH' ) || exit;

add_filter(
	'phantom_dynamic_css',
	function ( string $css ): string {
		$keys = array(
			'container_width', 'content_width', 'sidebar_width',
			'container_padding_x', 'container_padding_y',
			'section_padding_x', 'section_padding_y',
			'content_padding_x', 'content_padding_y',
			'body_min_width', 'body_max_width',
			'gap', 'column_gap', 'row_gap',
		);

		$px_keys = array(
			'container_width', 'content_width', 'sidebar_width',
			'container_padding_x', 'container_padding_y',
			'section_padding_x', 'section_padding_y',
			'content_padding_x', 'content_padding_y',
			'body_min_width', 'body_max_width',
			'gap', 'column_gap', 'row_gap',
		);

		$map    = \PhantomCore\Settings_Registry::get_css_var_map();
		$output = '';

		foreach ( $keys as $k ) {
			if ( ! isset( $map[ $k ] ) ) {
				continue;
			}
			$val = get_option( 'phantom_' . $k, '' );
			if ( '' !== $val ) {
				$val_display = $val;
				if ( in_array( $k, $px_keys, true ) && is_numeric( $val ) ) {
					$val_display .= 'px';
				}
				$output .= "\t" . $map[ $k ] . ': ' . esc_attr( $val_display ) . ';' . "\n";
			}
		}

		if ( '' !== $output ) {
			$css .= ':root {' . "\n" . $output . '}' . "\n";
		}

		return $css;
	},
	50
);
