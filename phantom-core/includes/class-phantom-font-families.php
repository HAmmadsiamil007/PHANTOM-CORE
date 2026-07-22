<?php
/**
 * Phantom Core — Font Families
 *
 * System fonts + Google Fonts list + fallback stacks.
 *
 * @package Phantom_Core
 */

defined( 'ABSPATH' ) || exit;

class Phantom_Font_Families {

	private static ?Phantom_Font_Families $instance = null;

	public static function instance(): Phantom_Font_Families {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function get_system_fonts(): array {
		return array(
			'Arial'           => 'Arial, Helvetica, sans-serif',
			'Georgia'         => 'Georgia, "Times New Roman", serif',
			'Helvetica'       => 'Helvetica, Arial, sans-serif',
			'Tahoma'          => 'Tahoma, Geneva, sans-serif',
			'Times New Roman' => '"Times New Roman", Georgia, serif',
			'Trebuchet MS'    => '"Trebuchet MS", Helvetica, sans-serif',
			'Verdana'         => 'Verdana, Geneva, sans-serif',
		);
	}

	public function get_google_fonts(): array {
		return apply_filters( 'phantom_google_fonts', array(
			// Sans-Serif
			'Inter'             => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Roboto'            => array( 100, 300, 400, 500, 700, 900 ),
			'Open Sans'         => array( 300, 400, 500, 600, 700, 800 ),
			'Lato'              => array( 100, 300, 400, 700, 900 ),
			'Montserrat'        => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Poppins'           => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Nunito'            => array( 200, 300, 400, 600, 700, 800, 900 ),
			'Nunito Sans'       => array( 200, 300, 400, 600, 700, 800, 900 ),
			'Raleway'           => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Work Sans'         => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'DM Sans'           => array( 400, 500, 700 ),
			'Plus Jakarta Sans' => array( 200, 300, 400, 500, 600, 700, 800 ),
			'Figtree'           => array( 300, 400, 500, 600, 700, 800, 900 ),
			'Source Sans 3'     => array( 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Noto Sans'         => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Ubuntu'            => array( 300, 400, 500, 700 ),
			'Oswald'            => array( 200, 300, 400, 500, 600, 700 ),
			'Karla'             => array( 200, 300, 400, 500, 600, 700, 800 ),
			'Manrope'           => array( 200, 300, 400, 500, 600, 700, 800 ),
			'Epilogue'          => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Be Vietnam Pro'    => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Lexend'            => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Space Grotesk'     => array( 300, 400, 500, 600, 700 ),
			'Public Sans'       => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Sora'              => array( 100, 200, 300, 400, 500, 600, 700, 800 ),
			'Jost'              => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Rubik'             => array( 300, 400, 500, 600, 700, 800, 900 ),
			'Archivo'           => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Barlow'            => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Barlow Condensed'  => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Fira Sans'         => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Hanken Grotesk'    => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'IBM Plex Sans'     => array( 100, 200, 300, 400, 500, 600, 700 ),
			'Outfit'            => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Syne'              => array( 400, 500, 600, 700, 800 ),
			'Chivo'             => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Kanit'             => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Mukta'             => array( 200, 300, 400, 500, 600, 700, 800 ),
			'Rajdhani'          => array( 300, 400, 500, 600, 700 ),
			'Titillium Web'     => array( 200, 300, 400, 600, 700, 900 ),
			'Cabin'             => array( 400, 500, 600, 700 ),
			'Heebo'             => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Assistant'         => array( 200, 300, 400, 500, 600, 700, 800 ),
			'Alegreya Sans'     => array( 100, 300, 400, 500, 700, 800, 900 ),
			'Encode Sans'       => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Exo 2'             => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Abel'              => array( 400 ),
			'Prompt'            => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Maven Pro'         => array( 400, 500, 600, 700, 800, 900 ),
			'Asap'              => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Quicksand'         => array( 300, 400, 500, 600, 700 ),
			'Abril Fatface'     => array( 400 ),
			'Alfa Slab One'     => array( 400 ),
			'Anton'             => array( 400 ),
			'Arimo'             => array( 400, 500, 600, 700 ),
			'Bebas Neue'        => array( 400 ),
			'Catamaran'         => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Days One'          => array( 400 ),
			'Didact Gothic'     => array( 400 ),
			'Francois One'      => array( 400 ),
			'Gothic A1'         => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Nanum Gothic'      => array( 400, 700, 800 ),
			'Noto Sans KR'      => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Noto Sans JP'      => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Noto Sans SC'      => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'M PLUS Rounded 1c' => array( 100, 300, 400, 500, 700, 800, 900 ),
			'Pathway Gothic One' => array( 400 ),
			'Righteous'         => array( 400 ),
			'Secular One'       => array( 400 ),
			'Zen Kaku Gothic New' => array( 300, 400, 500, 700, 900 ),
			'Zen Maru Gothic'   => array( 300, 400, 500, 700, 900 ),
			// Serif
			'Playfair Display'   => array( 400, 500, 600, 700, 800, 900 ),
			'Merriweather'       => array( 300, 400, 700, 900 ),
			'Lora'               => array( 400, 500, 600, 700 ),
			'EB Garamond'        => array( 400, 500, 600, 700, 800 ),
			'Cormorant Garamond' => array( 300, 400, 500, 600, 700 ),
			'PT Serif'           => array( 400, 700 ),
			'Noto Serif'         => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Source Serif 4'     => array( 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Bitter'             => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Libre Baskerville'  => array( 400, 700 ),
			'Crimson Pro'        => array( 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Crimson Text'       => array( 400, 600, 700 ),
			'Cardo'              => array( 400, 700 ),
			'DM Serif Display'   => array( 400 ),
			'DM Serif Text'      => array( 400 ),
			'Alegreya'           => array( 400, 500, 600, 700, 800, 900 ),
			'Fraunces'           => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Domine'             => array( 400, 500, 600, 700 ),
			'Taviraj'            => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Literata'           => array( 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Spectral'           => array( 200, 300, 400, 500, 600, 700, 800 ),
			'Old Standard TT'    => array( 400, 700 ),
			'Zilla Slab'         => array( 300, 400, 500, 600, 700 ),
			'Slabo 27px'         => array( 400 ),
			'Vollkorn'           => array( 400, 500, 600, 700, 800, 900 ),
			'Faustina'           => array( 300, 400, 500, 600, 700, 800 ),
			'Newsreader'         => array( 200, 300, 400, 500, 600, 700, 800 ),
			'Frank Ruhl Libre'   => array( 300, 400, 500, 700, 900 ),
			'STIX Two Text'      => array( 400, 500, 600, 700 ),
			'Prata'              => array( 400 ),
			'Bodoni Moda'        => array( 400, 500, 600, 700, 800, 900 ),
			'Marcellus'          => array( 400 ),
			'Marcellus SC'       => array( 400 ),
			'Cinzel'             => array( 400, 500, 600, 700, 800, 900 ),
			'Cinzel Decorative'  => array( 400, 700, 900 ),
			'Arvo'               => array( 400, 700 ),
			'Crete Round'        => array( 400 ),
			'Fjord One'          => array( 400 ),
			'Judson'             => array( 400, 700 ),
			'Mate'               => array( 400 ),
			'Neuton'             => array( 200, 300, 400, 700, 800 ),
			'Poly'               => array( 400 ),
			'Rufina'             => array( 400, 700 ),
			'Sorts Mill Goudy'   => array( 400 ),
			'Trocchi'            => array( 400 ),
			'Petrona'            => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Yrsa'               => array( 300, 400, 500, 600, 700 ),
			'Trirong'            => array( 100, 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Karma'              => array( 300, 400, 500, 600, 700 ),
			'Rasa'               => array( 300, 400, 500, 600, 700 ),
			'Halant'             => array( 300, 400, 500, 600, 700 ),
			// Decorative / Display
			'Lobster'            => array( 400 ),
			'Lobster Two'        => array( 400, 700 ),
			'Pacifico'           => array( 400 ),
			'Caveat'             => array( 400, 500, 600, 700 ),
			'Dancing Script'     => array( 400, 500, 600, 700 ),
			'Great Vibes'        => array( 400 ),
			'Satisfy'            => array( 400 ),
			'Cookie'             => array( 400 ),
			'Alex Brush'         => array( 400 ),
			'Parisienne'         => array( 400 ),
			'Tangerine'          => array( 400, 700 ),
			'Orbitron'           => array( 400, 500, 600, 700, 800, 900 ),
			'Press Start 2P'     => array( 400 ),
			'Bangers'            => array( 400 ),
			'Fredoka One'        => array( 400 ),
			'Fredoka'            => array( 300, 400, 500, 600, 700 ),
			'Teko'               => array( 300, 400, 500, 600, 700 ),
			'Yanone Kaffeesatz'  => array( 200, 300, 400, 500, 600, 700 ),
			'Bowlby One SC'      => array( 400 ),
			'Luckiest Guy'       => array( 400 ),
			'Chewy'              => array( 400 ),
			'Permanent Marker'   => array( 400 ),
			'Kaushan Script'     => array( 400 ),
			'Amaranth'           => array( 400, 700 ),
			'Concert One'        => array( 400 ),
			'Passion One'        => array( 400, 700, 900 ),
			'Fugaz One'          => array( 400 ),
			'Sigmar One'         => array( 400 ),
			'Patua One'          => array( 400 ),
			'Titan One'          => array( 400 ),
			'Modak'              => array( 400 ),
			'Bubblegum Sans'     => array( 400 ),
			'Knewave'            => array( 400 ),
			'Monoton'            => array( 400 ),
			'Unica One'          => array( 400 ),
			'Rampart One'        => array( 400 ),
			'Train One'          => array( 400 ),
			'Yusei Magic'        => array( 400 ),
			'Kiwi Maru'          => array( 300, 400, 500 ),
			'Stick'              => array( 400 ),
			'RocknRoll One'      => array( 400 ),
			'Reggae One'         => array( 400 ),
			'Mochiy Pop P One'   => array( 400 ),
			'Mochiy Pop P'       => array( 400 ),
			'Hina Mincho'        => array( 400 ),
			'Sawarabi Mincho'    => array( 400 ),
			'Sawarabi Gothic'    => array( 400 ),
			// Handwriting
			'Indie Flower'              => array( 400 ),
			'Cedarville Cursive'        => array( 400 ),
			'Homemade Apple'            => array( 400 ),
			'Covered By Your Grace'     => array( 400 ),
			'Gloria Hallelujah'         => array( 400 ),
			'Patrick Hand'              => array( 400 ),
			'Architects Daughter'       => array( 400 ),
			'Gochi Hand'                => array( 400 ),
			'Reenie Beanie'             => array( 400 ),
			'Handlee'                   => array( 400 ),
			'Shadows Into Light'        => array( 400 ),
			'Shadows Into Light Two'    => array( 400 ),
			'Rock Salt'                 => array( 400 ),
			'Just Another Hand'         => array( 400 ),
			'Coming Soon'               => array( 400 ),
			'Bad Script'                => array( 400 ),
			'Marck Script'              => array( 400 ),
			'Neucha'                    => array( 400 ),
			'Pangolin'                  => array( 400 ),
			'Short Stack'               => array( 400 ),
			// Monospace
			'JetBrains Mono'    => array( 100, 200, 300, 400, 500, 600, 700, 800 ),
			'Fira Mono'         => array( 400, 500, 700 ),
			'Fira Code'         => array( 300, 400, 500, 600, 700 ),
			'Source Code Pro'   => array( 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Space Mono'        => array( 400, 700 ),
			'IBM Plex Mono'     => array( 100, 200, 300, 400, 500, 600, 700 ),
			'Roboto Mono'       => array( 100, 200, 300, 400, 500, 600, 700 ),
			'Inconsolata'       => array( 200, 300, 400, 500, 600, 700, 800, 900 ),
			'Cousine'           => array( 400, 700 ),
			'Major Mono Display' => array( 400 ),
			'Nanum Gothic Coding' => array( 400, 700 ),
			'Overpass Mono'     => array( 300, 400, 500, 600, 700 ),
			'PT Mono'           => array( 400 ),
			'Share Tech Mono'   => array( 400 ),
			'Syne Mono'         => array( 400 ),
			'Xanh Mono'         => array( 400 ),
			'DM Mono'           => array( 300, 400, 500 ),
			'Cutive Mono'       => array( 400 ),
			'Oxygen Mono'       => array( 400 ),
			'Ubuntu Mono'       => array( 400, 700 ),
		) );
	}

	public function get_font_stack( string $font_family ): string {
		$system = $this->get_system_fonts();
		if ( isset( $system[ $font_family ] ) ) {
			return $system[ $font_family ];
		}
		return '"' . $font_family . '", sans-serif';
	}

	public function get_all(): array {
		return array(
			'system' => $this->get_system_fonts(),
			'google' => $this->get_google_fonts(),
		);
	}

	public function get_subsets(): array {
		return array(
			'latin',
			'latin-ext',
			'cyrillic',
			'cyrillic-ext',
			'greek',
			'greek-ext',
			'vietnamese',
		);
	}

	public function get_font_enqueue_url( $fonts = array(), $second_param = array() ): string {
		if ( is_string( $fonts ) ) {
			$fonts   = array_filter( array( $fonts, $second_param ) );
			$subsets = func_num_args() > 2 ? func_get_arg( 2 ) : array();
		} else {
			$fonts   = is_array( $fonts ) ? $fonts : array();
			$subsets = is_array( $second_param ) ? $second_param : array();
		}

		$families = array();
		foreach ( $fonts as $font ) {
			$font = trim( $font );
			if ( '' !== $font ) {
				$families[] = rawurlencode( $font ) . ':wght@100;200;300;400;500;600;700;800;900';
			}
		}

		if ( empty( $families ) ) {
			$families[] = 'Archivo:wght@100;200;300;400;500;600;700;800;900';
			$families[] = 'Playfair+Display:wght@400;500;600;700;800;900';
		}

		$family = implode( '&family=', $families );
		$url    = 'https://fonts.googleapis.com/css2?family=' . $family . '&display=swap';

		if ( ! empty( $subsets ) ) {
			$url .= '&subset=' . implode( ',', array_map( 'sanitize_text_field', $subsets ) );
		}

		return $url;
	}
}
