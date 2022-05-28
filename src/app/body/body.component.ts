import { OnInit, Component } from '@angular/core';

interface HanoiDisk{
	id:number;
	size:number;
	x:number;
	y:number;
	next:HanoiDisk | undefined;
}
interface Tower{
	id:number;
	disk:HanoiDisk | undefined;
}

@Component({
	selector: 'app-body',
	templateUrl: './body.component.html',
	styleUrls: ['./body.component.scss']
})
export class BodyComponent implements OnInit {


	// DISKS
	hanoi_disks: HanoiDisk[] = [];
	hanoi_disk_amount: number = 6;

	// TOWERS
	tower1: Tower;
	tower2: Tower;
	tower3: Tower;
	towers: Tower[];

	// MEASUREMENTS
	tower_width: number = 0;
	map_height: number = 0;
	map_width: number = 0;
	disks_height: number = 0;
	disks_separation: number = 0;

	// CLICKS
	FIRST_CLICK: number = 0;
	SECOND_CLICK: number = 1;
	click_state: number = this.FIRST_CLICK;
	
	// MOVEMENTS
	movements_amount: number = 0;
	min_movements:number = 0;
	
	// DATE
	start_millisecons:number = 0;
	end_millisecons:number = 0;
	time_slapsed:number = 0;
	minutes_seconds_elapsed:string = "";
	
	//


	constructor() {

		// TORRES
		this.tower1 = {id:1, disk:this.get_disk(1)};
		this.tower2 = {id:2, disk:undefined};
		this.tower3 = {id:3, disk:undefined};

		// data structure
		this.build_tree();

		// LISTA DE TORRES
		this.towers = [this.tower1, this.tower2, this.tower3];

		// TOWER DIMENSIONS
		this.tower_width = 0;
		this.map_height = 0;
		this.map_width = 0;


		// ESPERAMOS AL ngAfterViewInit();
		this.resize();

		// ON RESIZE
		window.onresize = this.resize.bind(this);

	}

	calculate_min_movements(){
		this.min_movements = (Math.pow(2,this.hanoi_disk_amount))-1;		
	}

	build_tree(){

		// min m
		this.calculate_min_movements();
		this.movements_amount = 0;
		
		// date
		this.start_millisecons = Date.now();

		// LISTA DE DISCOS	
		this.hanoi_disks = [];
		this.hanoi_disks.push({
			id:this.hanoi_disk_amount, 
			size:0, 
			x:0, 
			y:0, 
			next:undefined}
		);
		for (let x = 0; x < this.hanoi_disk_amount-1; x++) {
			this.hanoi_disks.push({
				id: (this.hanoi_disk_amount-1)-x, // 5 - 0 = 0; 5 - 1 = 4;...
				size:0, 
				x:0, 
				y:0, 
				next:this.get_disk(this.hanoi_disk_amount-x)
			});
		}

		// TORRES
		this.tower1 = {id:1, disk:this.get_disk(1)};
		this.tower2 = {id:2, disk:undefined};
		this.tower3 = {id:3, disk:undefined};

		// LISTA DE TORRES
		this.towers = [this.tower1, this.tower2, this.tower3];
	}

	resize() {		
		this.get_map_size();
		this.set_disks_sizes();
		this.set_disks_coordinates();
	}

	get_map_size() {
		let w = window.innerWidth;
		let h = window.innerHeight;

		if(w>h){ // laptop
			this.map_width = w * .7;
			this.map_height = h * .55;
		} else { // mobile
			this.map_width = w * .9;
			this.map_height = w * .6;
		}
		this.tower_width = this.map_width/3;
	}

	set_disks_sizes() {
		// HEIGHT
		this.disks_height = this.map_height * 0.05;
		// WIDTHs
		for (const disk of this.hanoi_disks) {
			disk.size = this.tower_width - ((0.1 * this.tower_width) * (disk.id + 1))
		}
	}

	set_disks_coordinates() {
		// ASIGNAR COORDINATES
		this.set_disk_coordinates_per_tower(0);
		this.set_disk_coordinates_per_tower(1);
		this.set_disk_coordinates_per_tower(2);
	}

	recursive_disk_amount: number = 0;

	set_disk_coordinates_per_tower(tower_index: number) {

		// win?
		this.recursive_disk_amount = 0;

		let indice_x: number = 0;
		let indice_y: number = 0;

		let disk_pointer: HanoiDisk | undefined = undefined;
		const tower: Tower = this.towers[tower_index];
		
		if (tower.disk) {

			disk_pointer = tower.disk;
			indice_x = this.get_disk_x(tower_index, disk_pointer.size);
			disk_pointer.y = this.get_disk_y(indice_y);
			disk_pointer.x = indice_x;

			this.recursive_disk_amount++;

			// si este disco tiene siguiente
			while (disk_pointer.next) {
				
				indice_y++;
				this.recursive_disk_amount++;

				disk_pointer = disk_pointer.next;
				disk_pointer.y = this.get_disk_y(indice_y);
				
				disk_pointer.x = this.get_disk_x(tower_index, disk_pointer.size);
			}
		}

		if (tower_index != 0) {
			if (this.recursive_disk_amount == this.hanoi_disk_amount) {
				this.win()
			}
		}
	}

	gameover: boolean = false;
	win() {
		this.gameover = true;
		this.time_slapsed = this.calculate_slapsed_time();
		let minutes = this.time_slapsed / 1000
		this.minutes_seconds_elapsed = Math.floor(minutes / 60).toString() + " minutos y " + Math.floor(minutes % 60).toString() + " segundos";
	}
	calculate_slapsed_time() {
		this.end_millisecons = Date.now();
		return this.end_millisecons - this.start_millisecons;
	}

	get_disk_y(index: number) {
		let y: number = 0;
		y += ((this.disks_separation + this.disks_height) * index);
		return y;
	}
	get_disk_x(index: number, size: number) {
		let x: number = 0;
		x = this.tower_width * index; // comienzo del TILE
		x += (this.tower_width - size) / 2 // centrar
		return x;
	}

	ngOnInit(): void { }

	get_disk(id: number) {
		for (const disk of this.hanoi_disks) {
			if (disk.id == id) return disk;
		}
		return this.hanoi_disks[0];
	}

	get_last_disk(tower_index: number) {

		const tower: Tower = this.towers[tower_index];
		let disk_pointer: HanoiDisk | undefined = undefined;

		if (tower.disk) {

			disk_pointer = tower.disk;

			// si este disco tiene siguiente
			while (disk_pointer.next) {
				disk_pointer = disk_pointer.next;
			}
		}

		return disk_pointer;
	}

	click_tower_index: number = -1;
	last_click_tower_index: number = 0;
	choosen_disk: HanoiDisk | undefined = undefined;
	disk_behind_choosen_disk: HanoiDisk | undefined = undefined;
	waiting_for_second_click: boolean = false;

	first_click(index_tower: number) {
		// comprobar que hay algun disco
		this.choosen_disk = this.get_last_disk(index_tower);

		if (this.choosen_disk) {
			this.click_state = this.SECOND_CLICK;
			this.waiting_for_second_click = true;
		}
	}

	click(index_tower: number) {

		this.click_tower_index = index_tower;

		// primer click
		if (this.click_state === this.FIRST_CLICK) {

			this.first_click(index_tower);

		} else { // SEGUNDO CLICK

			// vuelta al principio
			this.click_state = this.FIRST_CLICK;
			this.waiting_for_second_click = false;

			// si clickas en la misma tower
			if (this.last_click_tower_index === index_tower) {
				return;
			}

			// el disco sobre el que se pondrá el disco movido
			this.disk_behind_choosen_disk = this.get_last_disk(index_tower);

			// si hay disco elegido
			if (!this.choosen_disk) return;

			// si el disco de debajo es más pequeño
			if (this.disk_behind_choosen_disk) { // disco de debajo
				if (this.disk_behind_choosen_disk.id > this.choosen_disk.id) { // disco de debajo es más grande
					// this.click_state = this.D
					this.first_click(index_tower);
					this.last_click_tower_index = index_tower;
					return;
				}
			}

			// MOVE
			this.movements_amount++;
			// la torre a donde va el disco y la torre de donde viene
			const tower_from: Tower = this.towers[this.last_click_tower_index];

			this.remove_last_disk(tower_from);
			this.add_last_disk(this.click_tower_index, this.choosen_disk);
			this.set_disks_coordinates();


		}

		this.last_click_tower_index = index_tower;

	}

	add_last_disk(index_tower: number, disk: HanoiDisk) {
		let last_disk: HanoiDisk | undefined = this.get_last_disk(index_tower);

		disk.next = undefined;
		if (!last_disk) { // no hay discos en la torre
			this.towers[index_tower].disk = disk;
		} else {
			last_disk.next = disk;
		}
	}

	remove_last_disk(tower: Tower) {

		let disk_pointer: HanoiDisk | undefined = undefined;

		if (tower.disk) {
			disk_pointer = tower.disk;

			// le quitamos el puntero del TOWER hacia su disco, si olo hay 1 disco
			if (!disk_pointer.next) {
				tower.disk = undefined;

			} else { // es el primer disco, el penúltimo?
				if (!disk_pointer.next.next) {
					disk_pointer.next = undefined;
				}
			}


			// si este disco tiene siguiente
			while (disk_pointer.next) { // 1DISK
				disk_pointer = disk_pointer.next; // 2DISK
				if (disk_pointer.next) {// si hay siguiente
					if (!disk_pointer.next.next) { // si es el penúltimo
						disk_pointer.next = undefined;
					}
				}
			}

		}	
	}

	change_disk_amount(e: any){
		this.hanoi_disk_amount = parseInt(e.target.value);		
		this.build_tree();
		this.resize();
	}

	reload(){
		this.gameover = false;
		this.build_tree();
		this.resize();
	}


}
