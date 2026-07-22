<?php

namespace PhantomCore;

defined( 'ABSPATH' ) || exit;

class Fonts {

	private static ?Fonts $instance = null;

	public static function instance(): Fonts {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function get_all_fonts(): array {
		$families = \Phantom_Font_Families::instance();
		return array_merge(
			$families->get_system_fonts(),
			$this->get_google_font_list()
		);
	}

	public function get_google_font_list(): array {
		$fonts  = \Phantom_Font_Families::instance()->get_google_fonts();
		$result = array();
		foreach ( $fonts as $name => $weights ) {
			$result[ $name ] = $name;
		}
		return $result;
	}

	public function get_system_font_list(): array {
		$fonts  = \Phantom_Font_Families::instance()->get_system_fonts();
		$result = array();
		foreach ( $fonts as $name => $stack ) {
			$result[ $name ] = $name;
		}
		return $result;
	}

	public function get_subsets(): array {
		return \Phantom_Font_Families::instance()->get_subsets();
	}

	public function get_subsets_for_select(): array {
		$map = array();
		foreach ( $this->get_subsets() as $subset ) {
			$map[ $subset ] = $subset;
		}
		return $map;
	}

	public function get_enqueue_url( $fonts = array() ): string {
		$options = get_option( 'phantom_options', array() );
		$subsets = array();
		if ( ! empty( $options['font_subset'] ) && is_array( $options['font_subset'] ) ) {
			$subsets = array_map( 'sanitize_text_field', $options['font_subset'] );
		}
		if ( is_string( $fonts ) ) {
			$fonts = func_num_args() > 1 ? array( $fonts, func_get_arg( 1 ) ) : array( $fonts );
		}
		return \Phantom_Font_Families::instance()->get_font_enqueue_url( $fonts, $subsets );
	}

	public function get_local_fonts(): array {
		$dir = $this->get_local_dir();
		if ( ! is_dir( $dir ) ) {
			return array();
		}
		$files = glob( $dir . '*.css' );
		if ( ! is_array( $files ) ) {
			return array();
		}
		$fonts = array();
		foreach ( $files as $path ) {
			$fonts[] = array(
				'path' => $path,
				'name' => basename( $path, '.css' ),
				'url'  => $this->get_local_url() . basename( $path ),
			);
		}
		return $fonts;
	}

	public function get_local_dir(): string {
		$upload_dir = wp_upload_dir();
		return $upload_dir['basedir'] . '/phantom-fonts/';
	}

	public function get_local_url(): string {
		$upload_dir = wp_upload_dir();
		return $upload_dir['baseurl'] . '/phantom-fonts/';
	}
}
