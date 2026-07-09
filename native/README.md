# SpecForge Native Interface

This folder contains the C and C++ interface for SpecForge Launch Studio.

It includes:

- C ABI header
- C++ core implementation
- command line scoring interface
- command line export interface
- smoke test source

The API is intentionally small so it can be called from C, C++, Python bindings, Node native addons, or future WebAssembly builds.
