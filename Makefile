build:
	@component build

components:
	@component install

clean:
	rm -fr build components

.PHONY: clean components build